from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import PhoneVerification, UserActivity
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PhoneVerificationSerializer,
    OTPVerifySerializer,
    PasswordChangeSerializer,
    UserActivitySerializer
)
from .utils import send_otp_sms

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """Register a new user"""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description='User registered and logged in',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """Login user and return tokens"""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description='User logged in',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserLogoutView(APIView):
    """Logout user by blacklisting refresh token"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='logout',
                description='User logged out',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class SendOTPView(APIView):
    """Send OTP to phone number for verification"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = PhoneVerificationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        verification = serializer.save()
        
        # Send OTP via SMS
        success, message = send_otp_sms(verification.phone_number, verification.otp_code)
        
        if success:
            return Response({
                'message': f'OTP sent to {verification.phone_number}',
                'expires_at': verification.expires_at
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send OTP',
                'details': message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPView(APIView):
    """Verify OTP code"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        return Response({
            'message': 'Phone number verified successfully',
            'phone_verified': True
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='password_change',
            description='User changed password',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


class UserActivityListView(generics.ListAPIView):
    """Get user activity history"""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserActivitySerializer

    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)
