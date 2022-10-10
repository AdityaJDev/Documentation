from django.views.generic import ListView

from qux.seo.mixin import SEOMixin
from ..models import API, APIObject


class DocsView(SEOMixin, ListView):
    model = API
    template_name = "docs/index.html"
    queryset = API.objects.all()
    extra_context = {"objects": APIObject.objects.all()}
