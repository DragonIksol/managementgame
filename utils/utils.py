import math
import random

from django.http.response import JsonResponse

from game.models import *

costs_by_level_map = {
    # level: [esm, min_buy_esm, egp, max_sell_egp]
    1: [1, 800, 3, 6500],
    2: [1.5, 650, 2.5, 6000],
    3: [2, 500, 2, 5500],
    4: [2.5, 400, 1.5, 5000],
    5: [3, 300, 1, 4500]
}

next_level_chance_map = {
    # old_lvl: [lvl1, lvl2, lvl3, lvl4, lvl5] при умножении на 12
    1: [4, 4, 2, 1, 1],
    2: [3, 4, 3, 1, 1],
    3: [1, 3, 4, 3, 1],
    4: [1, 1, 3, 4, 3],
    5: [1, 1, 2, 4, 4],
}


def get_current_player(game_id):
    game = Game.objects.get(id=game_id)
    step = game.step
    players = PlayerGameInfo.objects.filter(room_id=game.id)
    players_count = len(players)
    senior_index = [index for index, value in enumerate(players) if value.senior_player][0]
    cur_player_index = (step - 1 + senior_index) % players_count
    return players[cur_player_index]


def get_game_month(game_id):
    return 1


def get_senior_player(game_id):
    # game = Game.objects.get(id=game_id)
    # step = game.step
    # players = PlayerGameInfo.objects.filter(room_id=game.id)
    # players_count = len(players)
    # month = math.floor(step/players_count)
    # senior_index = month % players_count
    # return players[senior_index]
    return PlayerGameInfo.objects.filter(room_id=game_id, senior_player=True)


def get_next_level(game_id):
    game = Game.objects.get(id=game_id)
    level = game.level
    level_chances = next_level_chance_map[level]
    rand = random.random() * 12
    sum = 0
    next_level = 1
    for chance in level_chances:
        sum += chance
        if rand > sum:
            next_level += 1
        else:
            break

    return next_level


# проверяет закончили ли свой этап все игроки
def check_turn_finish(game_id):
    players = PlayerGameInfo.objects.filter(room_id=game_id)
    all_finish = True
    for player in players:
        if not player.player_turn_finish:
            all_finish = False
            break
    return all_finish

#новый месяц
def end_month(game_id):
    deduction_of_costs(game_id)
    #смена уровня и увеличение месяца
    game = Game.objects.get(id=game_id)
    game.step = game.step + 1
    game.level = get_next_level(game_id)
    game.save()
    # отслеживание постройки заводов
    playergameinfos = PlayerGameInfo.objects.filter(room_id=game_id)
    for playergameinfo in playergameinfos:
        buildlist = BuildRequestList.objects.filter(player_info_id=playergameinfo.id)
        for buildreq_in_list in buildlist:
            buildrequest = BuildRequest.objects.get(id=buildreq_in_list.request_id.id)
            if ((buildrequest.step + 5) == game.step):
                playergameinfo.simple_fabric_count = playergameinfo.simple_fabric_count + buildrequest.simple_fabric_count
                playergameinfo.auto_fabric_count = playergameinfo.auto_fabric_count + buildrequest.automatical_fabric_count
                playergameinfo.save()
                buildrequest.delete()
        #отслеживание апгрейда
        upgradelist = AutomatizationRequestList.objects.filter(player_info_id=playergameinfo.id)
        for upgradereqlist in upgradelist:
            upgraderequest = AutomatizationRequest.objects.get(id=upgradereqlist.request_id.id)
            if ((upgraderequest.step + 9) == game.step):
                playergameinfo.simple_fabric_count = playergameinfo.simple_fabric_count - upgraderequest.count
                playergameinfo.auto_fabric_count = playergameinfo.auto_fabric_count + upgraderequest.count
                playergameinfo.save()
                upgraderequest.delete()
    #заявка на строительство и апгрейд выполняется
    for playergameinfo in playergameinfos:
        playergameinfo.egp = playergameinfo.egp + playergameinfo.esm_produce
        playergameinfo.esm = playergameinfo.esm - playergameinfo.esm_produce
        playergameinfo.esm_produce = 0
        playergameinfo.senioring = (playergameinfo.senioring + 1) % game.players_count
        playergameinfo.senior_player = (playergameinfo.senioring == 0)
        playergameinfo.save()

def end_turn(game_id):
    game = Game.objects.get(id=game_id)
    game.game_stage = ((game.game_stage) % 5) + 1
    players = PlayerGameInfo.objects.filter(room_id=game_id)
    if game.game_stage == 1:
        end_month(game_id)
        pass
    game.save()
    for player in players:
        player.player_turn_finish = False
        if player.capital < 0:
            # player = PlayerGameInfo.objects.get(room_id=game_id, player_id=request.user.id)
            player.esm_request_id and player.esm_request_id.delete()
            player.egp_request_id and player.egp_request_id.delete()
            player.loan_id and player.loan_id.delete()
            build_request_list = BuildRequestList.objects.filter(player_info_id=player.id)
            for request in build_request_list:
                build_request = BuildRequest.objects.get(id=request.request_id_id)
                build_request.delete()
            auto_request_list = AutomatizationRequestList.objects.filter(player_info_id=player.id)
            for request in auto_request_list:
                auto_request = AutomatizationRequest.objects.get(id=request.request_id_id)
                auto_request.delete()

            player.delete()
            room = Game.objects.get(id=game_id)
            room.players_count = room.players_count - 1
            if room.players_count == 0:
                room.delete()
            else:
                room.save()
        player.save()



# Изьятие издержек у всех игроков
def deduction_of_costs(game_id):
    players = PlayerGameInfo.objects.filter(room_id=game_id)
    for player in players:
        deduction_of_costs_personal(player)

# Изьятие издержек у игрока
def deduction_of_costs_personal(player):
    player.capital = player.capital - player.esm * 300 - player.egp * 500 - (player.simple_fabric_count or 0) * 1000 - (player.auto_fabric_count or 0) * 1500
    loans = Loan.objects.filter(id=player.loan_id)
    for loan in loans:
        player.capital = player.capital - loan.loan_amount*0.01
    player.save()
