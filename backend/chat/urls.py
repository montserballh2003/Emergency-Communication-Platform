from .views import ChatListView , ChatMessagesDetailView, ChatAdminMessagesDetailView   

from django.urls import path

urlpatterns = [
    path('', ChatListView.as_view(), name='chat-list'),
    path('messages/', ChatMessagesDetailView.as_view(), name='messages-list'),
    path('<int:pk>/messages/', ChatAdminMessagesDetailView.as_view(), name='messages-list'),
    
]