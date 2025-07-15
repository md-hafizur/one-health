from django.contrib import admin

# Register your models here.
from .models import User, UserProfile, Role

admin.site.register(User)
# display user id in admin panel
# class UserAdmin(admin.ModelAdmin):
#     search_fields = ('id', 'email', 'phone', )
#     list_filter = ('id', 'email', 'phone')
#     ordering = ('id',)
#     readonly_fields = ('id',)
#     fieldsets = (
#         (None, {'fields': ('id', 'email', 'phone')}),
#     )
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('email', 'phone', 'password1', 'password2')}
#         ),
#     )

# admin.site.register(User, UserAdmin)
admin.site.register(UserProfile) 
admin.site.register(Role)
