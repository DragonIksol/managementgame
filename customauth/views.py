import json
import os

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.checks.messages import Error
from django.http.response import JsonResponse
from django.shortcuts import redirect
from django.urls.base import reverse
from django.views.generic import TemplateView, View

from customauth.models import Player

# Create your views here.
class CustomAuthView(TemplateView):
    template_name = 'customauth.html'

    def post(self, request, *args, **kwargs):
        params = json.loads(request.body.decode('utf-8'))
        error = None
        try:
            user = authenticate(
                username=params.get('username'),
                password=params.get('password'))
            if user is not None:
                login(request, user)
            else:
                raise Exception("Пользователь не найден")
        except BaseException as err:
            print(err)
            error = str(err)


        return JsonResponse({
            "success": not error,
            "error": error
        })


class CustomRegisterView(TemplateView):
    template_name = 'customregister.html'

    def post(self, request, *args, **kwargs):
        params = json.loads(request.body.decode('utf-8'))
        user = Player.objects.create_user(
            params.get('username'),
            params.get('email'),
            params.get('password')
        )
        user.avatar_path = params.get('avatar_url')
        user.save()
        login(request, user)
        return JsonResponse({
            "success": True
        })

class AvatarsView(View):
    def get(self, request, *args, **kwargs):
        error = None
        file_paths = []
        try:
            avatars_path = 'static/resources/images/avatars'
            avatars_os_path = os.path.join(settings.BASE_DIR, avatars_path)
            file_paths = [f'/{avatars_path}/{x}' for x in os.listdir(avatars_os_path)]
        except BaseException:
            error = "Не удалось найти аватары"

        return JsonResponse({
            "data": file_paths,
            "error": error
        })
