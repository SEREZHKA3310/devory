from django.urls import path
from django.views.generic import RedirectView, TemplateView

from . import views

app_name = "main"

urlpatterns = [
    path("", views.index, name="index"),
    path("index.html", RedirectView.as_view(pattern_name="main:index", permanent=True)),
    path("robots.txt", TemplateView.as_view(template_name="main/robots.txt", content_type="text/plain")),
    path("sitemap.xml", TemplateView.as_view(template_name="main/sitemap.xml", content_type="application/xml")),
]

for slug in views.PAGES:
    urlpatterns += [
        # Основной адрес: /services/
        path(f"{slug}/", views.page, {"slug": slug}, name=slug),
        # Старые ссылки /services.html ведут на новый адрес
        path(f"{slug}.html", RedirectView.as_view(pattern_name=f"main:{slug}", permanent=True)),
    ]
