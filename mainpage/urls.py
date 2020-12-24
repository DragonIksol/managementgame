
from django.urls import path, include
from django.contrib.auth.decorators import login_required

from .views import *

urlpatterns = [
    path('', login_required(MainView.as_view())),
    path('createRoom/', login_required(CreateRoomView.as_view())),
]