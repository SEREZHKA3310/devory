from django.http import Http404
from django.shortcuts import render

# Страницы сайта (имена файлов в main/templates/main/ без .html).
# Список выводит convert_to_django.py — вставь его сюда, если страниц стало больше.
PAGES = [
    "about",
    "automation",
    "contacts",
    "development",
    "growth",
    "services",
    "solution-client-portal",
    "solution-order-flow",
    "solution-service-desk",
    "solutions",
    "support",
    "technology",
]


def index(request):
    return render(request, "main/index.html")


def page(request, slug):
    if slug not in PAGES:
        raise Http404
    return render(request, f"main/{slug}.html")


def not_found(request, exception=None):
    return render(request, "main/404.html", status=404)
