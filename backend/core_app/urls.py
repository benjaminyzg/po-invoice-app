from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CompanySettingDetailView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('company-settings/', CompanySettingDetailView.as_view(), name='company-settings'),
]