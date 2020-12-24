from game.models import Game
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
        except BaseException as err:
            error = str(err)

        return JsonResponse({   
            'room_id': room_id,
            'error': error
        })
