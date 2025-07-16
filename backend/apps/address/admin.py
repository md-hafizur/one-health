from django.contrib import admin

# Register your models here.
from .models import Union, Upazila, Zilla, Division, Village, Para, PostOffice, Address


admin.site.register(Division)
admin.site.register(Zilla)
admin.site.register(Upazila)
admin.site.register(Union)
admin.site.register(PostOffice)
admin.site.register(Village)
admin.site.register(Para)
admin.site.register(Address)

