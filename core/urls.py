from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('signin/', views.sigin, name='signin'),
    path('logout/', views.logout, name='logout'),
    path('settings/', views.settings, name='settings'),
    path('friends/', views.view_friends, name='view_friends'),
    path('friends/search/', views.search_and_send_friend_request, name='search_and_send_friend_request'),
]