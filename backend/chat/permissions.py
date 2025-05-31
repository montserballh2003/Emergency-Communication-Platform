from rest_framework.permissions import BasePermission

class IsAuthenticatedAndNotAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and not request.user.is_superuser