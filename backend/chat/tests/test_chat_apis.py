import pytest
from rest_framework import status
from model_bakery import baker
from django.contrib.auth import get_user_model
from chat.models import Chat

User = get_user_model()

@pytest.mark.django_db
class TestChatListView:
    def test_if_user_is_anonymous_returns_401(self, api_client):
        """
        Test that an anonymous user cannot access the ChatListView.
        """
        response = api_client.get('/chats/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_user_is_authenticated_but_not_admin_returns_403(self, api_client, authenticate):
        """
        Test that an authenticated non-admin user cannot access the ChatListView.
        """
        authenticate()  
        response = api_client.get('/chats/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_if_user_is_admin_returns_200(self, api_client, authenticate):
        """
        Test that an authenticated admin user can access the ChatListView and retrieve data.
        """
        authenticate(is_staff=True)
        baker.make(Chat, _quantity=3)
        response = api_client.get('/chats/')
        print(response.data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 3  #

    def test_if_no_data_found_returns_empty_list(self, api_client, authenticate):
        """
        Test that the ChatListView returns an empty list when no data is found.
        """
        # Create an admin user and authenticate
        authenticate(is_staff=True)

        # Make the request (no data created)
        response = api_client.get('/chats/')

        # Assert the response
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0  # Ensure an empty list is returned