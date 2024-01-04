from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='homeOffline'),
    path('ai/', views.homeAI, name='homeAI'),
    path('1vs1/', views.home1vs1, name='home1vs1'),
    path('tournament/', views.homeTournament, name='homeTournament'),
    path('tournament/table/', views.tournamentTable, name='tournamentTable'),
    path('tournament/table/play/', views.tournamentPlay, name='tournamentPlay'),
]