from django.db import models
from apps.accounts.models import Role

# Create your models here.
class PagePermission(models.Model):
    """
    Represents route/page permissions for a given role.
    """
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    name = models.CharField(max_length=255, help_text="Page or permission name (for readability)")
    route = models.CharField(max_length=255, help_text="URL path like /admin/dashboard or /users")

    def __str__(self):
        return f"{self.role.name} -> {self.route}"
    
    class Meta:
        unique_together = ('role', 'route')