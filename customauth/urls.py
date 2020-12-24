
from django.urls import path, include
from django.contrib.auth.decorators import login_required
from .views import *

urlpatterns = [
    path('', CustomAuthView.as_view()),
    path('registration/', CustomRegisterView.as_view())
]