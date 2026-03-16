from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, PhoneVerification, UserActivity


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 
                  'user_type', 'phone_number', 'date_of_birth', 'city', 'country')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            if user.is_suspended:
                raise serializers.ValidationError(f'Account suspended: {user.suspension_reason}')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 'user_type',
                  'phone_number', 'phone_verified', 'profile_picture', 'date_of_birth',
                  'address', 'city', 'country', 'no_show_count', 'total_penalty_amount',
                  'is_suspended', 'created_at')
        read_only_fields = ('id', 'email', 'user_type', 'phone_verified', 'no_show_count',
                           'total_penalty_amount', 'is_suspended', 'created_at')

    def get_full_name(self, obj):
        return obj.get_full_name()


class PhoneVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneVerification
        fields = ('phone_number',)

    def create(self, validated_data):
        user = self.context['request'].user
        phone_number = validated_data['phone_number']
        
        # Generate OTP
        verification = PhoneVerification.generate_otp(user, phone_number)
        
        # Send OTP via SMS (implement in views)
        return verification


class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        user = self.context['request'].user
        phone_number = attrs.get('phone_number')
        otp_code = attrs.get('otp_code')

        try:
            verification = PhoneVerification.objects.filter(
                user=user,
                phone_number=phone_number,
                verified=False
            ).latest('created_at')
        except PhoneVerification.DoesNotExist:
            raise serializers.ValidationError('No verification request found.')

        if not verification.verify(otp_code):
            if verification.attempts >= 3:
                raise serializers.ValidationError('Maximum verification attempts exceeded.')
            raise serializers.ValidationError('Invalid or expired OTP.')

        attrs['verification'] = verification
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ('id', 'activity_type', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')
