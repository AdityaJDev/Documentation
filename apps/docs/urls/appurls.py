from django.urls import path
from ..views.appviews import DocsView

app_name = "docs"

urlpatterns = [path("", DocsView.as_view(), name="home")]
