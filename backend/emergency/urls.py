from django.urls import path
from .apis.views import (
    EmergencyListView,
    EmergencyDetailView,
    EmergencyCreateView
)

urlpatterns = [
    path('', EmergencyListView.as_view(), name='emergency-list'),
    path('<int:pk>/', EmergencyDetailView.as_view(), name='emergency-detail'),
    path('create/', EmergencyCreateView.as_view(), name='emergency-create'),
]
