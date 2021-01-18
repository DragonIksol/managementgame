
from django.urls import path, include
from django.contrib.auth.decorators import login_required

from .views import *

urlpatterns = [
    path('', login_required(MainView.as_view())),
    path('createRoom/', login_required(CreateRoomView.as_view())),
    path('searchRooms/', login_required(SearchRoomsView.as_view())),
    path('startGame/', login_required(StartGame.as_view())),
    path('rules/', RulesView.as_view()),
    path('infodevelop/', InfoDevelopView.as_view()),
]