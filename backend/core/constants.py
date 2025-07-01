from django.db.models import TextChoices

class UserRole(TextChoices):
    ADMIN = 'admin', 'Admin'
    COLLECTOR = 'collector', 'DataCollector'
    PUBLIC = 'public', 'PublicUser'
