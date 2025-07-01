from django.contrib import admin

# Register your models here.
from .models import Union, Upazila, Zilla, Division

admin.site.register(Division)
admin.site.register(Zilla)
admin.site.register(Upazila)
admin.site.register(Union)
