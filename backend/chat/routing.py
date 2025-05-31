from django.urls import path

from .consumers import ClientSupportChatConsumer, AdminSupportChatConsumer

websocket_urlpatterns = [
    path('ws/chat/', ClientSupportChatConsumer.as_asgi()),
    path('ws/chat/<str:chat_name>/', AdminSupportChatConsumer.as_asgi()),
]