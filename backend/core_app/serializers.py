from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CatalogItem, CatalogPriceHistory

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', default='VIEWER', required=False)
    department = serializers.CharField(source='profile.department', allow_blank=True, required=False)
    phone = serializers.CharField(source='profile.phone', allow_blank=True, required=False)
    last_login = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    password = serializers.CharField(write_only=True, required=False, default="Welcome2026!")

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 
            'last_name', 'role', 'department', 'phone', 
            'last_login', 'password'
        ]

    def create(self, validated_data):
        # Extract profile fields so they don't break User.objects.create_user
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', 'Welcome2026!')

        # Create user with salted/hashed password
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # Update associated profile instance if present
        if hasattr(user, 'profile'):
            for attr, value in profile_data.items():
                setattr(user.profile, attr, value)
            user.profile.save()

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        if password:
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if hasattr(instance, 'profile'):
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.save()

        return instance


class CatalogItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogItem
        fields = '__all__'


class CatalogPriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogPriceHistory
        fields = '__all__'