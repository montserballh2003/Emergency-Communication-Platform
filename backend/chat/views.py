from rest_framework.generics import ListAPIView 
from rest_framework.permissions import IsAdminUser
from .permissions import IsAuthenticatedAndNotAdmin
from .models import Chat, Message
from .serializers import ChatSerializer , MessageSerializer
from .schema import *

@custom_chat_list_schema
class ChatListView(ListAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAdminUser]

@custom_chat_messages_list_schema
class ChatMessagesDetailView(ListAPIView):
    queryset = Message.objects.all().select_related('chat')
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticatedAndNotAdmin]
    def get_queryset(self):
        return super().get_queryset().filter(chat__room=f'chat_{self.request.user.id}')


@custom_chat_list_schema
class ChatAdminMessagesDetailView(ListAPIView):
    queryset = Message.objects.all().select_related('chat')
    serializer_class = MessageSerializer
    permission_classes = [IsAdminUser]
    def get_queryset(self):
        return super().get_queryset().filter(chat__id=self.kwargs['pk'])
    
