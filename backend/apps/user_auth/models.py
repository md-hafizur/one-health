from django.db import models
from core.utils.modeler import BaseModel
from apps.accounts.models import User

from django.utils import timezone
from core.utils.token import Token

from django.db.models.signals import post_save
from django.dispatch import receiver


class Session(BaseModel):
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    visitor_id = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    user_agent = models.TextField()
    remember = models.BooleanField(default=False)
    access_token_expires = models.DateTimeField(blank=True, null=True)
    refresh_token_expires = models.DateTimeField(blank=True, null=True)

    def update_access_token(self):
        token = Token()
        self.access_token = token.access_token(self.user, expires=5)
        self.access_token_expires = timezone.now() + timezone.timedelta(minutes=5)
        return self.save()

    def update_refresh_token(self):
        token = Token()
        self.refresh_token = token.refresh_token(
            self.user, expires=30 if self.remember else 1
        )
        self.refresh_token_expires = timezone.now() + timezone.timedelta(
            days=30 if self.remember else 1
        )
        return self.save()


@receiver(post_save, sender=Session)
def set_expires(sender, instance, created, **kwargs):
    if created:
        token = Token()
        instance.access_token = token.access_token(instance.user)
        instance.access_token_expires = timezone.now() + timezone.timedelta(minutes=5)
        if instance.remember:
            instance.refresh_token_expires = timezone.now() + timezone.timedelta(
                days=30
            )
            instance.refresh_token = token.refresh_token(instance.user, expires=30)
        else:
            instance.refresh_token_expires = timezone.now() + timezone.timedelta(days=1)
            instance.refresh_token = token.refresh_token(instance.user, expires=1)
        instance.save()
