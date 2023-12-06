from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('ai/', views.homeAI, name='home'),
    path('1vs1/', views.home1vs1, name='home'),
    path('tournament', views.homeTournament, name='home'),
]