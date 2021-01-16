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
        game = Game.objects.get(id=game_id)

        data.update({
            'id': game.id,
            'players_count': game.players_count,
            'current_player_turn': get_current_player(game_id).id,
            'step': game.step,
            'level': game.level,
            'esm_bank': math.floor(costs_by_level_map[game.level][0] * game.players_count),
            'min_buy_esm': costs_by_level_map[game.level][1],
            'egp_bank': math.floor(costs_by_level_map[game.level][2] * game.players_count),
            'max_sell_egp': costs_by_level_map[game.level][3]
        })

        return JsonResponse({
            'data': data
        })


class BuyESMView(View):

    def post(self, request, *args, **kwargs):
        params = json.loads(request.body)
        esm_count = params.get('esm_count')
        cost = params.get('cost')
        game_id = params.get('game_id')
        error = None

        print(esm_count, cost, game_id)

        return JsonResponse({
            'success': not error,
            'error': error
        })


class SellEGPView(View):

    def post(self, request, *args, **kwargs):
        params = json.loads(request.body)
        esm_count = params.get('esm_count')
        cost = params.get('cost')
        game_id = params.get('game_id')
        error = None

        print(esm_count, cost, game_id)

        return JsonResponse({
            'success': not error,
            'error': error
        })
