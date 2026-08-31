from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CatalogItem, CatalogPriceHistory

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', default='VIEWER')
    department = serializers.CharField(source='profile.department', allow_blank=True, required=False)
    phone = serializers.CharField(source='profile.phone', allow_blank=True, required=False)
    last_login = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    # pass

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'role', 
            'department', 
            'phone', 
            'is_active', 
            'last_login'
        ]

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        role = profile_data.get('role', 'VIEWER')
        
        # Create user with initial password
        user = User.objects.create_user(**validated_data, password='ChangeMe123!')
        UserProfile.objects.create(user=user, role=role)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        if 'role' in profile_data:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.role = profile_data['role']
            profile.save()
            
        return super().update(instance, validated_data)

class CatalogItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogItem
        fields = ['id', 'sku', 'name', 'category', 'unit_price', 'description', 'is_active']

class CatalogPriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogPriceHistory
        fields = ['id', 'old_price', 'new_price', 'changed_at']