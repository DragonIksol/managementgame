
from django.urls import path, include
from django.contrib.auth.decorators import login_required

from .views import *

urlpatterns = [
    path('', login_required(GameView.as_view())),
    path('players_data', PlayerDataView.as_view()),
    path('game_data', GameDataView.as_view())
]