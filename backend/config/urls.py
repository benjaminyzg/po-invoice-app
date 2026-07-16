from django.contrib import admin
from django.urls import path, include
from core_app.views import health_check
from rest_framework.authtoken import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/login/', views.obtain_auth_token),
    # Use the string-based include to avoid import-time loops
    path('api/invoices/', include('invoices.urls')), 
]