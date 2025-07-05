from django.contrib import admin
from .models import Session

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'visitor_id', 'ip', 'user_agent', 'remember', 'access_token_expires', 'refresh_token_expires')
    list_filter = ('remember', 'access_token_expires', 'refresh_token_expires')
    search_fields = ('user__email', 'ip', 'user_agent')
    raw_id_fields = ('user',)