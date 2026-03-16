from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('held', 'Held'),  # Money held in escrow
        ('completed', 'Completed'),
        ('refunded', 'Refunded'),
        ('partially_refunded', 'Partially Refunded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_METHOD = (
        ('card', 'Credit/Debit Card'),
        ('stripe', 'Stripe'),
        ('cash', 'Cash'),
        ('wallet', 'Wallet'),
    )
    
    # Unique payment ID
    payment_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Payment details
    booking = models.ForeignKey('trips.Booking', on_delete=models.CASCADE, related_name='payments')
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments_made')
    
    # Amount details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    driver_amount = models.DecimalField(max_digits=10, decimal_places=2)  # Amount driver receives
    
    # Payment method
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    
    # Status
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Stripe details
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    held_at = models.DateTimeField(null=True, blank=True)  # When money was held in escrow
    released_at = models.DateTimeField(null=True, blank=True)  # When money was released to driver
    
    # Additional info
    notes = models.TextField(blank=True)
    failure_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.payment_id} - ${self.amount} ({self.status})"

    def hold_payment(self):
        """Hold payment in escrow after successful charge"""
        if self.status == 'processing':
            self.status = 'held'
            self.held_at = timezone.now()
            self.save()
            return True
        return False

    def release_to_driver(self):
        """Release payment to driver after trip completion"""
        if self.status == 'held':
            self.status = 'completed'
            self.released_at = timezone.now()
            self.save()
            
            # Create payout record for driver
            DriverPayout.objects.create(
                payment=self,
                driver=self.booking.trip.driver,
                amount=self.driver_amount,
                status='pending'
            )
            return True
        return False

    def refund_payment(self, amount=None, reason=''):
        """Refund payment to customer"""
        if self.status not in ['held', 'completed']:
            return False, "Payment cannot be refunded"
        
        refund_amount = amount if amount else self.amount
        
        if refund_amount > self.amount:
            return False, "Refund amount exceeds payment amount"
        
        # Create refund record
        refund = Refund.objects.create(
            payment=self,
            amount=refund_amount,
            reason=reason,
            status='processing'
        )
        
        # Update payment status
        if refund_amount == self.amount:
            self.status = 'refunded'
        else:
            self.status = 'partially_refunded'
        
        self.save()
        return True, f"Refund of ${refund_amount} initiated"


class DriverPayout(models.Model):
    PAYOUT_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    payout_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payouts')
    driver = models.ForeignKey('drivers.DriverProfile', on_delete=models.CASCADE, related_name='payouts')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYOUT_STATUS, default='pending')
    
    # Bank details (in production, store securely or use payment processor)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    
    # Stripe payout details
    stripe_payout_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    failure_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'driver_payouts'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payout {self.payout_id} - ${self.amount} to {self.driver.user.get_full_name()}"

    def process_payout(self):
        """Process the payout to driver"""
        if self.status == 'pending':
            self.status = 'processing'
            self.processed_at = timezone.now()
            self.save()
            
            # Here you would integrate with payment processor (Stripe, etc.)
            # For now, we'll mark as completed
            self.complete_payout()
            return True
        return False

    def complete_payout(self):
        """Mark payout as completed"""
        if self.status == 'processing':
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()
            return True
        return False


class Refund(models.Model):
    REFUND_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    refund_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=REFUND_STATUS, default='pending')
    
    stripe_refund_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    failure_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'refunds'
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund {self.refund_id} - ${self.amount}"

    def process_refund(self):
        """Process the refund"""
        if self.status == 'pending':
            self.status = 'processing'
            self.processed_at = timezone.now()
            self.save()
            
            # Here you would integrate with payment processor
            self.complete_refund()
            return True
        return False

    def complete_refund(self):
        """Mark refund as completed"""
        if self.status == 'processing':
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()
            return True
        return False


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"Wallet for {self.user.get_full_name()} - ${self.balance}"

    def add_funds(self, amount, description=''):
        """Add funds to wallet"""
        if amount <= 0:
            return False
        
        self.balance += amount
        self.save()
        
        WalletTransaction.objects.create(
            wallet=self,
            transaction_type='credit',
            amount=amount,
            description=description,
            balance_after=self.balance
        )
        return True

    def deduct_funds(self, amount, description=''):
        """Deduct funds from wallet"""
        if amount <= 0 or amount > self.balance:
            return False
        
        self.balance -= amount
        self.save()
        
        WalletTransaction.objects.create(
            wallet=self,
            transaction_type='debit',
            amount=amount,
            description=description,
            balance_after=self.balance
        )
        return True


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    )
    
    transaction_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wallet_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type.title()} ${self.amount} - {self.wallet.user.get_full_name()}"
