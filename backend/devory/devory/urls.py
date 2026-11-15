from django.urls import include, path

urlpatterns = [
    path("", include("main.urls")),
]

# Страница 404 (работает при DEBUG = False)
handler404 = "main.views.not_found"
