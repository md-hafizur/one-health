from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.address.models import Union
from core.validators import phone_validator

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)  # e.g. admin, collector, public
    label = models.CharField(max_length=100)  # Human-readable label

    def __str__(self):
        return self.label


class User(AbstractUser):
    phone = models.CharField(
        max_length=11,
        validators=[phone_validator],
        unique=False,
        null=True,
        blank=True,
    )

    role = models.ForeignKey("Role", on_delete=models.PROTECT, null=True, blank=True)

    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='sub_users'
    )


    def save(self, *args, **kwargs):
        if not self.parent and User.objects.filter(phone=self.phone, parent__isnull=True).exclude(pk=self.pk).exists():
            raise ValueError("Phone number must be unique for main users (non-sub users).")

        if not self.is_superuser and not self.role:
            raise ValueError("Regular users must have a role.")

        super().save(*args, **kwargs)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Common fields here
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=11, validators=[phone_validator])
    # Fields mostly for public user
    father_name = models.CharField(blank=True, null=True)
    mother_name = models.CharField(blank=True, null=True)
    spouse_name = models.CharField(blank=True, null=True)
    photo = models.ImageField(blank=True, null=True)
    signature = models.ImageField(blank=True, null=True)
    address = models.ForeignKey(Union, on_delete=models.SET_NULL, null=True, blank=True, related_name='profiles')

    @property
    def upazila(self):
        return self.address.upazila if self.address else None

    @property
    def zilla(self):
        return self.upazila.zilla if self.upazila else None

    @property
    def division(self):
        return self.zilla.division if self.zilla else None