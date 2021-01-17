import math
import random

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

#проверяет закончили ли свой этап все игроки
def check_turn_finish(game_id):
    players = PlayerGameInfo.objects.filter(room_id=game_id)
    player_wil = True
    for player in players:
        player_wil = player_wil and player.player_turn_finish
    return player_wil



