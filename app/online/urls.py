from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='homeOnline'),
    path('play/<room_code>', views.game, name='gameOnline'),
]