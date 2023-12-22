from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('signin/', views.sigin, name='signin'),
    path('logout/', views.logout, name='logout'),
    path('settings/', views.settingsHome, name='settings'),
    path('friends/', views.view_friends, name='view_friends'),
    path('friends/search/', views.search_and_send_friend_request, name='search_and_send_friend_request'),
    path('profile/<int:id_user>/', views.profile_page, name='profile_page'),
    path('myprofile/', views.my_profile_page, name='my_profile_page'),
    path('login_with_42/', views.login_with_42, name='login_with_42'),
    path('complete/fortytwo-oauth2/', views.auth_complete, name='complete_fortytwo_oauth2'),
]