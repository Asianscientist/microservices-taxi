from rest_framework import permissions


class IsDriver(permissions.BasePermission):
    """Check if user is a driver"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.user_type == 'driver' and
            hasattr(request.user, 'driver_profile')
        )


class IsDriverOwner(permissions.BasePermission):
    """Check if user is the owner of the driver profile"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'driver_profile')
        )
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAdmin(permissions.BasePermission):
    """Check if user is admin"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.user_type == 'admin' or request.user.is_staff)
        )
