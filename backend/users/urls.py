from django.urls import path
from .apis import *



urlpatterns = [
    path('users/me/', UserMeViewSet.as_view({'get': 'retrieve', 'patch': 'update', 'delete':'destroy'}), name="users-me"),
    path('users/', UserRegisterView.as_view(), name='user'), 
    path('users/changepassword/', ChangePasswordView.as_view(), name='user-changepassword'), 
    path('users/request-reset-password/', RequestPasswordResetCodeView.as_view(), name='user-resetpassword'), 
    path('users/confirm-reset-password/', PasswordResetCodeView.as_view(), name='user-resetpasswordconfirm' ),
    path('auth/google/', GoogleAuthView.as_view()),
    path('auth/google/url/', CreateGoogleAuthLinkView.as_view()),
] 

