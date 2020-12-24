
from django.urls import path, include
from django.contrib.auth.decorators import login_required

from .views import *

urlpatterns = [
    path('', login_required(GameView.as_view())),
]