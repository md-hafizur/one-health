from django.contrib import admin
from .models import Payment, PaymentLog, PaymentFee

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'payment_method', 'transaction_id', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('user__username', 'user__email', 'transaction_id')
    raw_id_fields = ()

@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    list_display = ('payment', 'message', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('payment__transaction_id', 'message')
    raw_id_fields = ('payment',)

@admin.register(PaymentFee)
class PaymentFeeAdmin(admin.ModelAdmin):
    list_display = ('fee_name', 'role', 'amount', 'currency', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('role__name', 'fee_name')