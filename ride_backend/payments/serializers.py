from rest_framework import serializers
from .models import Payment, DriverPayout, Refund, Wallet, WalletTransaction


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = (
            'payment_id', 'payer', 'status', 'stripe_payment_intent_id',
            'stripe_charge_id', 'held_at', 'released_at'
        )


class CreatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['card', 'stripe', 'cash', 'wallet'])
    stripe_payment_method_id = serializers.CharField(required=False, allow_blank=True)


class DriverPayoutSerializer(serializers.ModelSerializer):
    payment_details = PaymentSerializer(source='payment', read_only=True)
    
    class Meta:
        model = DriverPayout
        fields = '__all__'
        read_only_fields = (
            'payout_id', 'payment', 'driver', 'status',
            'stripe_payout_id', 'processed_at', 'completed_at'
        )


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = '__all__'
        read_only_fields = (
            'refund_id', 'payment', 'status', 'stripe_refund_id',
            'processed_at', 'completed_at'
        )


class WalletSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Wallet
        fields = '__all__'
        read_only_fields = ('user', 'balance')


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = '__all__'
        read_only_fields = ('transaction_id', 'wallet', 'balance_after')


class AddFundsSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value
