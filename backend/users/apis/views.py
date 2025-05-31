import random
from django.core.mail import send_mail
from django.core.cache import cache
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from djoser.social import views as social
from .serializers import UserSerializer, MeSerializer, ChangePasswordSerializer , PasswordResetCodeSerializer,PasswordResetRequestSerializer
from .base_viewsets import RetrieveUpdateDestroyViewSet
from ..schema import *



class UserRegisterView(CreateAPIView):
    serializer_class = UserSerializer




class UserMeViewSet(RetrieveUpdateDestroyViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        return MeSerializer



class ChangePasswordView(CreateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [ IsAuthenticated ]

    def get_serializer_context(self):
        return {"request": self.request}
    
    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)




class CustomProviderAuthView(social.ProviderAuthView):
    @custom_provider_auth_view_get_schema
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @custom_provider_auth_view_post_schema
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)



@sent_email_schema
class RequestPasswordResetCodeView(CreateAPIView):
    serializer_class = PasswordResetRequestSerializer   
    def get_serializer_context(self):
        context = super().get_serializer_context()
        redirect_url = self.request.query_params.get('redirect_url')
        context['redirect_url'] = redirect_url
        return context


@confirm_reset
class PasswordResetCodeView(CreateAPIView):
    serializer_class = PasswordResetCodeSerializer
