from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # create_user handles password hashing
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    is_superuser = serializers.BooleanField(source='user.is_superuser', read_only=True)
    class Meta:
        model = Profile
        # include related user flags for frontend role-based UI
        fields = [
            'username', 'full_name', 'phone', 'address', 'city', 'country', 'created_at', 'is_staff', 'is_superuser'
        ]


# Custom serializer that restricts token obtain to staff users only
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Only allow staff users to use username/password login
        if not self.user.is_staff:
            raise serializers.ValidationError('Only admin users may obtain tokens via username/password')
        return data

