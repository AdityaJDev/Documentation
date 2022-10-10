from django.db import models

from qux.models import CoreModel
from qux.models import default_null_blank


class App(CoreModel):
    name = models.CharField(max_length=64, unique=True)

    class Meta:
        db_table = "docs_app"

    def __str__(self):
        return self.name


class APIObject(CoreModel):
    app = models.ForeignKey(App, on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=32, unique=True)
    data = models.TextField()
    description = models.TextField(**default_null_blank)

    class Meta:
        db_table = "docs_object"


class APIObjectAttribute(CoreModel):
    ATTR_TYPES = (
        ("date", "Date"),
        ("datetime", "DateTime"),
        ("string", "String"),
        ("integer", "Integer"),
        ("float", "Float"),
        ("currency", "Currency"),
    )

    name = models.CharField(max_length=32, unique=True)
    description = models.TextField(**default_null_blank)
    type = models.CharField(max_length=16, default="string", choices=ATTR_TYPES)

    class Meta:
        db_table = "docs_object_attribute"
        verbose_name = "Object Attribute"


class API(CoreModel):
    ACTION = (
        ("GET", "GET"),
        ("POST", "POST"),
        ("PUT", "PUT"),
        ("DELETE", "DELETE"),
    )

    app = models.ForeignKey(App, on_delete=models.DO_NOTHING)
    url = models.URLField("URL")
    path = models.CharField(max_length=1024, **default_null_blank)
    domain = models.CharField(
        max_length=256,
        default="https://api.finmachines.com/v1/",
        null=True,
        blank=True,
    )
    action = models.CharField(choices=ACTION, max_length=8)
    description = models.TextField(**default_null_blank)
    inputs = models.TextField(**default_null_blank)
    output = models.TextField(**default_null_blank)
    curl = models.TextField(**default_null_blank)
    python = models.TextField(**default_null_blank)

    class Meta:
        db_table = "docs_api"
        verbose_name = "REST API"
        verbose_name_plural = "REST API"
        unique_together = ["app", "action", "url"]
        ordering = ["id", "url", "action"]

    def __str__(self):
        return f"{self.app.name}:{self.action} {self.url}"
