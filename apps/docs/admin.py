from django.contrib import admin
from . import models

admin.site.register(models.App)
admin.site.register(models.API)
admin.site.register(models.APIObject)
