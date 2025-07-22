from rest_framework import serializers
from .models import Payment, PaymentLog

class PaymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentLog
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    logs = PaymentLogSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

class PaymentLogSerializer(serializers.ModelSerializer):
    payment_id = serializers.CharField(source='payment.id', read_only=True)
    user = serializers.CharField(source='payment.user.email', read_only=True)
    amount = serializers.DecimalField(source='payment.amount', max_digits=10, decimal_places=2, read_only=True)
    method = serializers.CharField(source='payment.payment_method', read_only=True)
    status = serializers.CharField(source='payment.status', read_only=True)
    date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = PaymentLog
        fields = [
            'id',
            'payment_id',
            'user',
            'amount',
            'method',
            'status',
            'date',
            'message',
        ]
