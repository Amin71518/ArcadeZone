from rest_framework.permissions import BasePermission


class IsSuperuser(BasePermission):
    """
    Разрешение на доступ только для суперпользователей.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff))
