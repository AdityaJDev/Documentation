from django import template
from markdown import markdown

register = template.Library()


@register.filter
def markup_to_html(value):
    return markdown(value)
