from rest_framework import serializers
from .models import * 
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = '__all__'
        
        
class MessageSerializer(serializers.ModelSerializer):
    chat_room = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id','body', 'sender', 'chat_room', 'created_at']

    def get_chat_room(self, obj):
        return obj.chat.room