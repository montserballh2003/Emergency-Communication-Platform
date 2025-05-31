from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Chat (models.Model) : 
    room = models.CharField(max_length=100, unique=True)
    def __str__(self) -> str:
        return f"{self.ticket.employee.full_name} | {self.ticket.client.full_name}"

    class Meta:
        ordering = ['id'] 
class Message (models.Model) : 
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='chat')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ('-created_at',)
        
    def __str__(self) -> str:
        return self.body