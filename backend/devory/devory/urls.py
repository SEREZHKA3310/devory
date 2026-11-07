from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("main.urls")),
]

# Страница 404 (работает при DEBUG = False)
handler404 = "main.views.not_found"
