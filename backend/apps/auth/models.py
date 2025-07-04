from django.db import models

# Create your models here.
class VerificationCode(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)  # 6-digit code
    created_at = models.DateTimeField(auto_now_add=True)
    destination = models.CharField(max_length=255)  # email address or phone number
    channel = models.CharField(max_length=10, choices=[('email', 'Email'), ('phone', 'Phone')])
    is_used = models.BooleanField(default=False)
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)


class Session(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    refresh_token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    user_agent = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.expires_at = timezone.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user} - {self.created_at}"