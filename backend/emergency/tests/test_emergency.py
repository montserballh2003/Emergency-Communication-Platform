# tests/test_jwt_token_obtain.py
import pytest
from model_bakery import baker
from rest_framework import status


@pytest.mark.django_db
class TestEmergencyList:
    
    def test_if_user_is_authenticated_returns_200(self, api_client, authenticate):
        authenticate()
        response = api_client.get('/emergency/')
        assert response.status_code == status.HTTP_200_OK
    def test_if_user_is_authenticated_returns_data(self, api_client, authenticate):
        authenticate()
        baker.make('emergency.Emergency', _quantity=3)
        response = api_client.get('/emergency/')
        assert response.data['count'] == 3
        
    def test_if_no_data_returns_empty_list(self, api_client, authenticate):
        authenticate()
        response = api_client.get('/emergency/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count']== 0
@pytest.mark.django_db
class TestEmergencyDetail:
    def test_if_user_is_authenticated_returns_data(self, api_client, authenticate):
        authenticate()
        emergency = baker.make('emergency.Emergency')  
        response = api_client.get(f'/emergency/{emergency.id}/')  
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == emergency.id
    
    def test_if_no_data_found_returns_404(self, api_client, authenticate):
        authenticate()
        response = api_client.get('/emergency/1/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
class TestEmergencyCreate:
    def test_if_user_is_annoynous_returns_401(self, api_client):
        response = api_client.post('/emergency/create/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_if_data_invalid_returns_400(self, api_client, authenticate):
        authenticate()
        response = api_client.post('/emergency/create/', {'title': 'test_title', 'description': 'test_description'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
    def test_if_data_valid_returns_201(self, api_client, authenticate):
        authenticate()
        response = api_client.post('/emergency/create/', {'emergency_type': 'O', 'description': 'test_description', 'location': 'test_location'})
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['emergency_type'] == 'O'
        assert response.data['description'] == 'test_description'

    def test_if_images_bigger_than_5_returns_400(self, api_client, authenticate):
        authenticate()
        response = api_client.post('/emergency/create/', {'emergency_type': 'O', 'description': 'test_description', 'location': 'test_location', 'images':[
            'image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg', 'image6.jpg'
        ]})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'images' in response.data