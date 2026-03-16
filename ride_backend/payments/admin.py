from django.contrib import admin
from .models import Payment, DriverPayout, Refund, Wallet, WalletTransaction


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'booking', 'payer', 'amount', 'payment_method', 
                   'status', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('payment_id', 'payer__email', 'booking__id')
    readonly_fields = ('payment_id', 'created_at', 'updated_at', 'held_at', 'released_at')
    
    fieldsets = (
        ('Payment Info', {'fields': ('payment_id', 'booking', 'payer')}),
        ('Amounts', {'fields': ('amount', 'platform_fee', 'driver_amount')}),
        ('Payment Method', {'fields': ('payment_method', 'stripe_payment_intent_id', 'stripe_charge_id')}),
        ('Status', {'fields': ('status', 'notes', 'failure_reason')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'held_at', 'released_at')}),
    )


@admin.register(DriverPayout)
class DriverPayoutAdmin(admin.ModelAdmin):
    list_display = ('payout_id', 'driver', 'amount', 'status', 'created_at', 'completed_at')
    list_filter = ('status', 'created_at')
    search_fields = ('payout_id', 'driver__user__email')
    readonly_fields = ('payout_id', 'created_at', 'processed_at', 'completed_at')


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('refund_id', 'payment', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('refund_id', 'payment__payment_id')
    readonly_fields = ('refund_id', 'created_at', 'processed_at', 'completed_at')


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'created_at', 'updated_at')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'wallet', 'transaction_type', 'amount', 
                   'balance_after', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('transaction_id', 'wallet__user__email')
    readonly_fields = ('transaction_id', 'created_at')
