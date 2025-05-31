from django.core import mail
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import status
from model_bakery import baker
import pytest

User = get_user_model()

@pytest.mark.django_db
class TestCreateUsers:
    def test_if_email_invalid_returns_400(self, api_client):
        response = api_client.post('/users/', {'email': 'invalid_email', 'password': 'ILoveDjango', 'password2': 'ILoveDjango'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_if_passwords_dont_match_returns_400(self, api_client):
        response = api_client.post('/users/', {'email': 'HqD0J@example.com', 'password': 'ILoveDjango', 'password2': 'ILoveDjango123'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
    def test_if_data_valid_returns_201(self, api_client):
        response = api_client.post('/users/', {'email': 'HqD0J@example.com', 'password': 'ILoveDjango', 'password2': 'ILoveDjango'})
        assert response.status_code == status.HTTP_201_CREATED
@pytest.mark.django_db
class TestChangePassword:
    def _extracted_from_test_if_password_is_the_same_as_old_one_returns_400_2(self, authenticate, api_client, arg2):
        authenticate()
        response = api_client.post(
            '/users/changepassword/',
            {
                'current_password': 'ILoveDjango',
                'password': 'ILoveDjango',
                'password2': arg2,
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
    def test_if_user_is_annonymous_returns_401(self, api_client):
        response = api_client.post('/users/changepassword/')
        print( response.status_code)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_passwords_dont_match_returns_400(self, api_client, authenticate):
        self._extracted_from_test_if_password_is_the_same_as_old_one_returns_400_2(
            authenticate, api_client, 'ILoveDjango123'
        )
    
    def test_if_password_is_the_same_as_old_one_returns_400(self, api_client, authenticate):
        self._extracted_from_test_if_password_is_the_same_as_old_one_returns_400_2(
            authenticate, api_client, 'ILoveDjango'
        )

    
    def test_if_password_is_incorrect_returns_400(self, api_client, authenticate):
        authenticate()
        response = api_client.post(
            '/users/changepassword/',
            {
                'current_password': 'ILoveDjango123',
                'password': 'ILoveDjango',
                'password2': 'ILoveDjango',
            },
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_if_data_valid_returns_204(self, api_client, authenticate):

        authenticate()
        
        response = api_client.post(
            '/users/changepassword/',
            {
                'current_password': 'ILoveDjango',
                'password': 'ILoveDjango123',
                'password2': 'ILoveDjango123',
            },
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

@pytest.mark.django_db
class TestRequestResetPassword():
    def test_smtp_settings_configured(self):
        """
        Ensure that all required SMTP settings are properly configured.
        """

        assert hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST, "EMAIL_HOST must be set"
        assert hasattr(settings, 'EMAIL_PORT') and isinstance(settings.EMAIL_PORT, int), "EMAIL_PORT must be set and an integer"
        assert hasattr(settings, 'EMAIL_USE_TLS'), "EMAIL_USE_TLS must be set to True or False"
        assert hasattr(settings, 'EMAIL_HOST_USER') and settings.EMAIL_HOST_USER, "EMAIL_HOST_USER must be set"
        assert hasattr(settings, 'EMAIL_HOST_PASSWORD') and settings.EMAIL_HOST_PASSWORD, "EMAIL_HOST_PASSWORD must be set"
        
    def test_if_data_valid_send_mail(self, api_client):
        baker.make(User, email='testuser@gmail.com')
        mail.outbox = []
        response = api_client.post('/users/request-reset-password/', {"email":'testuser@gmail.com'})
        
        assert response.status_code == status.HTTP_201_CREATED
        assert len(mail.outbox) == 1
        email = mail.outbox[0]
        assert email.subject == "Password Reset Code"
        assert email.to == ['testuser@gmail.com']
    
    def test_if_email_invalid_returns_400(self, api_client):

        response = api_client.post('/users/request-reset-password/', {"email":'invalid_email'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_if_email_is_not_exist_returns_400(self, api_client):
        response = api_client.post('/users/request-reset-password/', {"email":'HqD0J@example.com'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        
@pytest.mark.django_db
class TestUserInfo:
    def test_if_user_is_annonymous_returns_401(self, api_client):
        response = api_client.get('/users/me/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    def test_if_user_is_authenticated_returns_200(self, api_client, authenticate):
        authenticate()
        response = api_client.get('/users/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'testuser@gmail.com'
    def test_if_user_patch_valid_returns_200(self, api_client, authenticate):
        authenticate()
        response = api_client.patch('/users/me/', {'first_name': 'John', 'last_name': 'Doe'})
        assert response.status_code == status.HTTP_200_OK
    
    def test_if_user_delete_returns_204(self, api_client, authenticate):
        authenticate()
        response = api_client.delete('/users/me/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
    
    def test_if_user_try_to_update_email_returns_400(self, api_client, authenticate):
        authenticate()
        
        response = api_client.patch('/users/me/', {'email': 'HqD0J@example.com'})
        print(response.data)
        assert response.data['email'] == 'testuser@gmail.com'

        