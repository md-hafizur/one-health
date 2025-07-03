from django.core.cache import cache
from django.db import models
import  random

def generate_verification_code():
    return str(random.randint(100000, 999999))

def send_verification(user):
    if user.phone:
        code = generate_verification_code()
        cache.set(f'verify_phone:{user.phone}', code, timeout=300)  # 5 min expiry
        send_verification_sms(user.phone, code)
    elif user.email:
        code = generate_verification_code()
        cache.set(f'verify_email:{user.email}', code, timeout=300)
        send_mail(
            'Verify Your Account',
            f'Your verification code: {code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email]
        )





class BaseModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created"]
