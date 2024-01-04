from django.conf.urls import url
from django.urls import path
from online.consumers import PongConsumer

websocket_urlpatterns = [
    path('ws/play/<str:room_code>/', PongConsumer.as_asgi()),
]