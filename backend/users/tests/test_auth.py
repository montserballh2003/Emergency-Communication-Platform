# tests/test_jwt_token_obtain.py
import pytest
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from datetime import timedelta
import time
from datetime import datetime

@pytest.mark.django_db
class TestJWTObtainToken:
    def test_obtain_token_with_valid_credentials(self, api_client, authenticate):
        authenticate()
        data = {
            'email': 'testuser@gmail.com',
            'password': 'ILoveDjango'
        }
        response = api_client.post("/auth/jwt/create/", data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_obtain_token_with_invalid_credentials(self, api_client, authenticate):
        authenticate()

        data = {
            'email': 'testuser@gmail.com',
            'password': 'wrong_password'
        }
        response = api_client.post("/auth/jwt/create/", data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data

    def test_obtain_token_with_missing_fields(self, api_client):
        data = {
            'username': 'testuser'
        }
        response = api_client.post("/auth/jwt/create/", data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data


@pytest.mark.django_db
class TestJWTRefreshToken:
    def test_refresh_token_with_valid_refresh_token(self, api_client, authenticate):
        user = authenticate()
        refresh = RefreshToken.for_user(user)
        data = {
            'refresh': str(refresh)
        }
        response = api_client.post("/auth/jwt/refresh/", data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        
    def test_refresh_token_with_invalid_refresh_token(self, api_client):
        data = {
            'refresh': 'invalid_refresh_token'
        }
        response = api_client.post("/auth/jwt/refresh/", data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data

    def test_refresh_token_with_missing_refresh_token(self, api_client):
        data = {
            # 'refresh' field is missing
        }
        response = api_client.post("/auth/jwt/refresh/", data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'refresh' in response.data

@pytest.mark.django_db
class TestJWTVerifyToken:
    def test_verify_token_with_valid_token(self, api_client, authenticate):
        # Authenticate and obtain tokens
        user = authenticate()
        access = AccessToken.for_user(user)
        data = {
            'token': str(access)
        }
        response = api_client.post("/auth/jwt/verify/", data, format='json')
        assert response.status_code == status.HTTP_200_OK

    def test_verify_token_with_invalid_token(self, api_client):
        data = {
            'token': 'invalid_access_token'
        }
        response = api_client.post("/auth/jwt/verify/", data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data

    def test_verify_token_with_missing_token(self, api_client):
        data = {
            # 'token' field is missing
        }
        response = api_client.post("/auth/jwt/verify/", data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'token' in response.data

@pytest.mark.django_db
class TestProtectedEndpoints:
    def test_access_protected_endpoint_with_valid_token(self, api_client, authenticate):
        """
        Test accessing a protected endpoint with a valid JWT access token.
        """
        user = authenticate()
        access = AccessToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        response = api_client.get("/users/me/", format='json')  # Replace with your actual protected endpoint
        assert response.status_code == status.HTTP_200_OK
        # Add more assertions based on the response content

    def test_access_protected_endpoint_with_invalid_token(self, api_client):
        """
        Test accessing a protected endpoint with an invalid JWT access token.
        """
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalidtoken')
        self._extracted_from_test_access_protected_endpoint_with_expired_token_6(
            api_client, "/users/me/"
        )

    def test_access_protected_endpoint_without_token(self, api_client):
        """
        Test accessing a protected endpoint without providing any JWT access token.
        """
        self._extracted_from_test_access_protected_endpoint_with_expired_token_6(
            api_client, "/users/me/"
        )

    def _extracted_from_test_access_protected_endpoint_with_expired_token_6(self, api_client, arg1):
        response = api_client.get(arg1, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data