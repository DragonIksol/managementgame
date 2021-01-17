import json
import math

from utils.utils import *
from game.models import AutomatizationRequestList, BuildRequestList, Game, PlayerGameInfo
from customauth.models import Player
from django.db.models.query_utils import select_related_descend
from django.http.response import JsonResponse
from django.views.generic import TemplateView, View
from django.conf import settings
from django import template

register = template.Library()


# Create your views here.
class GameView(TemplateView):
    template_name = 'game.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['player_name'] = self.request.user.username
        context['player_id'] = self.request.user.id
        context['avatar_path'] = self.request.user.avatar_path
        player_info = PlayerGameInfo.objects.get(player_id=self.request.user)
        room = Game.objects.get(id=player_info.room_id.id)
        context['game_id'] = room.id
        players_info = PlayerGameInfo.objects.filter(room_id=room)
        players_data = []
        for p_info in players_info:
            player = Player.objects.get(id=p_info.player_id.id)
            players_data.append({
                'avatar_path': player.avatar_path,
                'username': player.username,
                'player_id': player.id
            })
        # player_ids = [x.player_id for x in players_info]
        # players =  Player.objects.filter(id__in=player_ids)
        context['players_data'] = players_data
        return context

    @register.filter(name='getkey')
    def getkey(value, arg):
        return value[arg]


class PlayerDataView(View):

    def get(self, request, *args, **kwargs):
        game_id = request.GET.get('game_id')
        data = []
        players_info = PlayerGameInfo.objects.filter(room_id=game_id)

        for player in players_info:
            build_requests = BuildRequestList.objects.filter(player_info_id=player.id)
            automatization_fabrics = AutomatizationRequestList.objects.filter(player_info_id=player.id)
            data.append({
                'room_id': player.room_id.id,
                'player_id': player.player_id.id,
                'loan': player.loan_id.loan_amount if player.loan_id else None,
                'capital': player.capital,
                'auto_fabric_count': player.auto_fabric_count,
                'simple_fabric_count': player.simple_fabric_count,
                'esm': player.esm,
                'egp': player.egp,
                'senior_player': player.senior_player,
                'build_fabrics': len(build_requests),
                'automatization_fabrics': len(automatization_fabrics),
                'player_turn': get_current_player(game_id).id == player.id
            })

        return JsonResponse({
            'data': data
        })


class GameDataView(View):

    def get(self, request, *args, **kwargs):
        game_id = request.GET.get('game_id')
        data = {}
        players_data = []
        game = Game.objects.get(id=game_id)

        players_info = PlayerGameInfo.objects.filter(room_id=game_id)

        for player in players_info:
            build_requests = BuildRequestList.objects.filter(player_info_id=player.id)
            automatization_fabrics = AutomatizationRequestList.objects.filter(player_info_id=player.id)
            players_data.append({
                'room_id': player.room_id.id,
                'player_id': player.player_id.id,
                'loan': player.loan_id.loan_amount if player.loan_id else None,
                'capital': player.capital,
                'auto_fabric_count': player.auto_fabric_count,
                'simple_fabric_count': player.simple_fabric_count,
                'esm': player.esm,
                'egp': player.egp,
                'senior_player': player.senior_player,
                'build_fabrics': len(build_requests),
                'automatization_fabrics': len(automatization_fabrics),
                'player_turn_finish': player.player_turn_finish
            })

        data.update({
            'id': game.id,
            'players_count': game.players_count,
            'month': game.step,
            'game_stage': game.game_stage,
            'game_stage_name': game.game_stage_map.get(game.game_stage),
            'level': game.level,
            'esm_bank': math.floor(costs_by_level_map[game.level][0] * game.players_count),
            'min_buy_esm': costs_by_level_map[game.level][1],
            'egp_bank': math.floor(costs_by_level_map[game.level][2] * game.players_count),
            'max_sell_egp': costs_by_level_map[game.level][3],
            'players_data': players_data
        })

        return JsonResponse({
            'data': data
        })


class SurrenderView(View):
    def post(self, request, *args, **kwargs):
        params = json.loads(request.body)
        game_id = params.get('game_id')
        error = None
        try:
            player = PlayerGameInfo.objects.get(room_id=game_id, player_id=request.user.id)
            player.delete()
            room = Game.objects.get(id=game_id)
            room.players_count = room.players_count - 1
            if room.players_count == 0:
                room.delete()
            else:
                room.save()
        except BaseException as err:
            print(err)
            error = str(err)
        return JsonResponse({
            'success': not error,
            'error': error
        })


# TODO
class FinalTurnView(View):
    def post(self, request, *args, **kwargs):
        params = json.loads(request.body)
        game_id = params.get('game_id')
        error = None
        player = PlayerGameInfo.objects.get(player_id=request.user.id, room_id=game_id)

        player.player_turn_finish = True
        player.save()

        return JsonResponse({
            'success': not error,
            'error': error
        })


# TODO купить ЕСМ
class BuyESMView(View):

    def post(self, request, *args, **kwargs):
        params = json.loads(request.body)
        esm_count = params.get('esm_count')
        cost = params.get('cost')
        game_id = params.get('game_id')
        error = None

        try:
            player = PlayerGameInfo.objects.get(player_id=request.user.id, room_id=game_id)
            esm_request = ESMRequest(esm_count=esm_count, esm_price=cost)
            esm_request.save()
            player.esm_request_id = esm_request.id
            player.player_turn_finish = True
            player.save()

            all_finish = True
            all_players = PlayerGameInfo.objects.filter(room_id=game_id)
            for player in all_players:
                if not player.player_turn_finish:
                    all_finish = False
                    break

            if all_finish:
                #завершить стадию
                pass
        except BaseException as err:
            print(err)
            error = str(err)

        return JsonResponse({
            'success': not error,
            'error': error
        })


class ProduceEGPView(View):
    def post(self, request, *args, **kwargs):
        params = json.loads(request.body)
        esm_count = params.get('esm_count')
        cost = params.get('cost')
        game_id = params.get('game_id')
        error = None

        try:
            player = PlayerGameInfo.objects.get(player_id=request.user.id, room_id=game_id)
            esm_request = ESMRequest(esm_count=esm_count, esm_price=cost)
            esm_request.save()
            player.esm_request_id = esm_request.id
            player.player_turn_finish = True
            player.save()

            all_finish = True
            all_players = PlayerGameInfo.objects.filter(room_id=game_id)
            for player in all_players:
                if not player.player_turn_finish:
                    all_finish = False
                    break

            if all_finish:
                #завершить стадию
                pass

        except BaseException as err:
            print(err)
            error = str(err)

        return JsonResponse({
            'success': not error,
            'error': error
        })


# TODO продать ЕГП
# Продажа ЕГП-Вова
class SellEGPView(View):

    def post(self, request, *args, **kwargs):
        params = json.loads(request.body)
        egp_count = params.get('egp_count')
        cost = params.get('cost')
        game_id = params.get('game_id')
        error = None
        print(egp_count, cost, game_id)
        # сохранение заявки
        player = PlayerGameInfo.objects.get(player_id=request.user.id, room_id=game_id)
        egp_request = EGPRequest(egp_count=egp_count, egp_price=cost)
        egp_request.save()
        player.esm_request_id = egp_request.id
        player.player_turn_finish = True
        player.save()

        if check_turn_finish(game_id):
            self.bank_EGP_bargaining(game_id)

        return JsonResponse({
            'success': not error,
            'error': error
        })

    def bank_EGP_bargaining(self, game_id):
        players = PlayerGameInfo.objects.filter(room_id=game_id)
        egp_s = []
        for player in players:
            egp_s.append(EGPRequest.objects.get(id=player.egp_request_id))
        self.choose_interested_request(egp_s)
        return

    # здесь формируются списки игроков с самым интересным предложением для банка
    def choose_interested_request(self, egp_s):
        egp_s_price_mass = [x.egp_price for x in egp_s]
        min_price_egp = min(egp_s_price_mass)
        egp_request_mass = EGPRequest.objects.filter(egp_price=min_price_egp)
        players = []
        for egp_request in egp_request_mass:
            players.append(PlayerGameInfo.objects.filter(
                egp_request_id=egp_request.id))
        self.choose_seniors_request(players)
        return

    # здесь формируются списки игроки чьи заявки по старшинству важнее
    def choose_seniors_request(self,players):
        pass
