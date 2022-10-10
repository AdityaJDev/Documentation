from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("qux.auth.urls")),
    path("account/tokens/", include("qux.token.urls")),
    path("docs/", include("apps.docs.urls.appurls")),
]
