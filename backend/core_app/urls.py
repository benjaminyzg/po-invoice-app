from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CatalogItemViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'catalog-items', CatalogItemViewSet, basename='catalogitem')

urlpatterns = [
    path('', include(router.urls)),
]