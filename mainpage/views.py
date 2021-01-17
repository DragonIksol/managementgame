from django.core.checks.messages import Error
from game.models import Game, PlayerGameInfo
import json
from django.db.models.query_utils import select_related_descend
from django.http.response import JsonResponse
from django.views.generic import TemplateView, View
from django.conf import settings

# Create your views here.
class MainView(TemplateView):
    template_name = 'main.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['player'] = self.request.user.username
        context['avatar_path'] = self.request.user.avatar_path

        return context


class CreateRoomView(View):
    def post(self, request, *args, **kwargs):
        room_id = None
        error = None
        params = json.loads(request.body.decode('utf-8'))
        players_count = params.get('players_count')
        room_name = params.get('room_name')

        try:
            new_room = Game(players_count=players_count, room_name=room_name)
            new_room.save()
            room_id = new_room.id
            new_player_info = PlayerGameInfo(player_id=request.user, room_id=new_room)
            new_player_info.save()
        except BaseException as err:
            print(error)
            error = str(err)

        return JsonResponse({
            'room_id': room_id,
            'error': error
        })

    def get(self, request, *args, **kwargs):
        params = request.GET
        room_id = params.get('room_id')
        error = None
        data = []

        try:
            players_info = PlayerGameInfo.objects.filter(room_id=room_id)
            for player in players_info:
                data.append({
                    'player_name': player.player_id.username,
                    'player_id': player.player_id.id
                })
        except BaseException as err:
            print(str)
            error = str(err)

        return JsonResponse({
            'error': error,
            'data': data
        })

    def put(self, request, *args, **kwargs):
        print(request.body)
        params = json.loads(request.body)
        room_id = params.get('room_id')
        error = None

        try:
            room = Game(id=room_id)
            new_player_info = PlayerGameInfo(player_id=request.user, room_id=room)
            new_player_info.save()
        except BaseException as err:
            print(error)
            error = str(err)

        return JsonResponse({
            'error': error
        })

    def delete(self, request, *args, **kwargs):
        params = json.loads(request.body.decode('utf-8'))
        is_creator = params.get('is_creator')
        room_id = params.get('room_id')
        error = None

        try:
            if is_creator:
                new_room = Game(id=params.get('room_id'))
                new_room.delete() # здесь не надо, т.к. каскадное удаление
            else:
                player_info = PlayerGameInfo.objects.get(player_id=request.user, room_id=room_id)
                player_info.delete()
        except BaseException as err:
            print(err)
            error = str(err)

        return JsonResponse({
            'error': error
        })


class SearchRoomsView(View):
    def get(self, request, *args, **kwargs):
        """
        data = [{
            "room_id": room_id,
            "number_of_seats": number_of_seats,
            "players_count": players_count,
            "room_name": room_name
        }]
        """
        data = []
        error = None

        try:
            rooms = Game.objects.all()
            for room in rooms:
                number_of_seats = len(PlayerGameInfo.objects.filter(room_id=room.id))
                print(number_of_seats)
                if room.step is not None:
                    continue
                data.append({
                    "room_id": room.id,
                    "number_of_seats": number_of_seats,
                    "players_count": room.players_count,
                    "room_name": room.room_name
                })

        except BaseException as err:
            print(err)
            error = str(err)
        return JsonResponse({
            'data': data,
            'error': error
        })


class StartGame(View):
    def get(self, request, *args, **kwargs):
        params = request.GET
        room_id = params.get('room_id')
        game_started = False
        room_closed = False
        error = None

        try:
            if Game.objects.filter(id=room_id).exists():
                room = Game.objects.get(id=room_id)
                step = room.step
                print(step)
                if step is not None:
                    game_started = True
            else:
                print('room_closed')
                room_closed = True
        except BaseException as err:
            print(err)
            error = str(err)
        return JsonResponse({
            'game_started': game_started,
            'room_closed': room_closed,
            'error': error
        })

    def post(self, request, *args, **kwargs):
        error = None
        params = json.loads(request.body)
        room_id = params.get('room_id')
        print(params)

        try:
            if room_id is None:
                raise Error('Комната не найдена')
            room = Game.objects.get(id=room_id)
            room.step = 1
            room.level = 3
            room.game_stage = 1
            players_info = PlayerGameInfo.objects.filter(room_id=room.id)
            for player in players_info:
                player.capital = 10000
                player.esm = 4
                player.egp = 2
                player.simple_fabric_count = 2
                if player.player_id.id == request.user.id:
                    player.senior_player = True

                player.save()
            print('game_start')
            room.save()
        except BaseException as err:
            print(err)
            error = str(err)

        return JsonResponse({
            'error': error
        })
