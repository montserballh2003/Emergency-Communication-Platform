from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet


class RetrieveUpdateDestroyViewSet(RetrieveModelMixin,
                                    UpdateModelMixin,
                                    DestroyModelMixin,
                                    GenericViewSet):
    pass