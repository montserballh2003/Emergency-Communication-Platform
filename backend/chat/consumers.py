import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils.timezone import now  
from .models import Chat, Message
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from .schema import Custom_admin_consumer

class BaseSupportChatConsumer(AsyncWebsocketConsumer):
    ROOM_GROUP_NAME = None

    async def connect(self):
        self.user = self.scope.get('user')
        await self.set_room_group_name()

        if not self.is_valid_user():
            await self.close()
            return

        await self.group_setup()

    async def disconnect(self, close_code):
        if self.ROOM_GROUP_NAME:
            await self.channel_layer.group_discard(
                self.ROOM_GROUP_NAME,
                self.channel_name
            )

    async def receive(self, text_data):
            try:
                text_data_json = json.loads(text_data)
                message = text_data_json['message']
            except json.JSONDecodeError:
                await self.send(json.dumps({
                    'error': 'Invalid JSON format.'
                }))
                return
            
            if not message.strip():
                await self.send(json.dumps({
                'error': 'Empty messages are not allowed.'
            }))
                return
            
            chat = await sync_to_async(Chat.objects.get)(room=self.ROOM_GROUP_NAME)
                
            await sync_to_async(Message.objects.create)(
                    sender=self.user,
                    chat=chat,
                    body=message
                )
            
            
            await self.channel_layer.group_send(
                    self.ROOM_GROUP_NAME,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'user': self.user
                    }
                )
    @Custom_admin_consumer
    async def chat_message(self, event):
        message = event['message']
        user = event['user']
        await self.send(text_data=json.dumps({
                'message': message,
                'user': user.id,
                'name': user.first_name,
                'is_admin': user.is_superuser,
                'time': now().isoformat(),
            }))

    def set_room_group_name(self):
        raise NotImplementedError

    def is_valid_user(self):
        return self.user.is_authenticated

    async def group_setup(self):
        await self.channel_layer.group_add(
            self.ROOM_GROUP_NAME,
            self.channel_name
        )
        await self.accept()


class ClientSupportChatConsumer(BaseSupportChatConsumer):
    @database_sync_to_async
    def set_room_group_name(self):
        self.ROOM_GROUP_NAME = f"chat_{self.user.id}"

        Chat.objects.get_or_create(room=self.ROOM_GROUP_NAME)

    def is_valid_user(self):
        return super().is_valid_user()  and not self.user.is_superuser


class AdminSupportChatConsumer(BaseSupportChatConsumer):
    @database_sync_to_async
    def set_room_group_name(self):
        self.ROOM_GROUP_NAME = self.scope['url_route']['kwargs']['chat_name']
        if not Chat.objects.filter(room=self.ROOM_GROUP_NAME).exists():
            self.ROOM_GROUP_NAME = None
            
    def is_valid_user(self):
        return self.user.is_authenticated and self.user.is_superuser and self.ROOM_GROUP_NAME is not None 
