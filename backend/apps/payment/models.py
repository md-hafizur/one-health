from django.db import models
from apps.accounts.models import User, Role
from core.utils.modeler import BaseModel

class Payment(BaseModel):
    PAYMENT_METHODS = (
        ('bkash', 'bKash'),
        ('nagad', 'Nagad')
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f"{self.user.email}'s payment of {self.amount} via {self.payment_method}"

class PaymentLog(BaseModel):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='logs')
    message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)


class PaymentFee(BaseModel):
    role = models.OneToOneField(Role, on_delete=models.CASCADE, related_name='payment_fee')
    fee_name = models.CharField(max_length=100, default="Standard Fee")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='BDT')
    is_active = models.BooleanField(default=True)
    verification_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_amount(self):
        return self.amount + self.verification_fee + self.processing_fee

    def __str__(self):
        return f"{self.role.name} - {self.amount} {self.currency}"