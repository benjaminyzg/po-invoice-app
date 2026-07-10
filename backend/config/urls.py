from django.contrib import admin
from django.urls import path
from django.urls import path, include
from core_app.views import health_check
from rest_framework.authtoken import views

urlpatterns = [
    path('admin/', admin.site.urls), # if you use default admin
    path('api/health/', health_check),
    path('api/login/', views.obtain_auth_token),
    path('api/invoices/', include('invoices.urls')),
]
