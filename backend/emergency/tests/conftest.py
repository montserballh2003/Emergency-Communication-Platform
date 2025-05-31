from rest_framework.test import APIClient
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticate(api_client):
    def do_authenticate(is_staff=False, password="ILoveDjango"):
        user = User.objects.create_user(
            email="testuser@gmail.com", 
            password=password, 
            is_staff=is_staff
        )
        api_client.force_authenticate(user=user)
        return user  
        
    return do_authenticate

