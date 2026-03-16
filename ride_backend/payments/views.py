from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from .models import Payment, DriverPayout, Refund, Wallet, WalletTransaction
from trips.models import Booking
from .serializers import (
    PaymentSerializer,
    CreatePaymentSerializer,
    DriverPayoutSerializer,
    RefundSerializer,
    WalletSerializer,
    WalletTransactionSerializer,
    AddFundsSerializer
)
from drivers.permissions import IsDriver
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentView(APIView):
    """Create a payment for a booking"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get booking
        try:
            booking = Booking.objects.get(
                id=serializer.validated_data['booking_id'],
                passenger=request.user
            )
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.status != 'pending':
            return Response(
                {'error': 'Booking is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_method = serializer.validated_data['payment_method']
        
        # Calculate platform fee (e.g., 10%)
        platform_fee = booking.total_amount * 0.10
        driver_amount = booking.total_amount - platform_fee
        
        # Create payment record
        payment = Payment.objects.create(
            booking=booking,
            payer=request.user,
            amount=booking.total_amount,
            platform_fee=platform_fee,
            driver_amount=driver_amount,
            payment_method=payment_method,
            status='processing'
        )
        
        # Process payment based on method
        if payment_method == 'stripe':
            try:
                # Create Stripe payment intent
                intent = stripe.PaymentIntent.create(
                    amount=int(booking.total_amount * 100),  # Convert to cents
                    currency='usd',
                    payment_method=serializer.validated_data.get('stripe_payment_method_id'),
                    confirm=True,
                    capture_method='manual',  # Hold funds, capture later
                )
                
                payment.stripe_payment_intent_id = intent.id
                payment.hold_payment()
                booking.confirm_booking()
                
                return Response({
                    'message': 'Payment successful',
                    'payment': PaymentSerializer(payment).data
                }, status=status.HTTP_200_OK)
                
            except stripe.error.CardError as e:
                payment.status = 'failed'
                payment.failure_reason = str(e)
                payment.save()
                return Response(
                    {'error': 'Payment failed', 'details': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        elif payment_method == 'wallet':
            # Deduct from wallet
            if not hasattr(request.user, 'wallet'):
                Wallet.objects.create(user=request.user)
            
            wallet = request.user.wallet
            if wallet.balance < booking.total_amount:
                payment.status = 'failed'
                payment.failure_reason = 'Insufficient wallet balance'
                payment.save()
                return Response(
                    {'error': 'Insufficient wallet balance'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            wallet.deduct_funds(
                booking.total_amount,
                f'Payment for booking #{booking.id}'
            )
            payment.hold_payment()
            booking.confirm_booking()
            
            return Response({
                'message': 'Payment successful',
                'payment': PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
        
        elif payment_method == 'cash':
            # Cash payments are confirmed on trip completion
            payment.status = 'pending'
            payment.save()
            booking.status = 'confirmed'
            booking.save()
            
            return Response({
                'message': 'Booking confirmed. Pay cash to driver.',
                'payment': PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
        
        else:
            payment.status = 'failed'
            payment.failure_reason = 'Invalid payment method'
            payment.save()
            return Response(
                {'error': 'Invalid payment method'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PaymentListView(generics.ListAPIView):
    """List payments for the authenticated user"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(payer=self.request.user)


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(payer=self.request.user)


class DriverPayoutsView(generics.ListAPIView):
    """List payouts for the authenticated driver"""
    serializer_class = DriverPayoutSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        return DriverPayout.objects.filter(driver=self.request.user.driver_profile)


class RequestPayoutView(APIView):
    """Request a payout (admin only)"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, payout_id):
        try:
            payout = DriverPayout.objects.get(payout_id=payout_id)
        except DriverPayout.DoesNotExist:
            return Response(
                {'error': 'Payout not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if payout.process_payout():
            return Response({
                'message': 'Payout processed successfully',
                'payout': DriverPayoutSerializer(payout).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Payout cannot be processed'},
                status=status.HTTP_400_BAD_REQUEST
            )


class RefundListView(generics.ListAPIView):
    """List refunds for the authenticated user"""
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Refund.objects.filter(payment__payer=self.request.user)


class WalletView(generics.RetrieveAPIView):
    """Get wallet details"""
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet


class WalletTransactionsView(generics.ListAPIView):
    """List wallet transactions"""
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return WalletTransaction.objects.filter(wallet=wallet)


class AddWalletFundsView(APIView):
    """Add funds to wallet"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddFundsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Added funds to wallet')
        
        # In production, you would process payment here via Stripe or other gateway
        # For now, we'll just add the funds
        wallet.add_funds(amount, description)
        
        return Response({
            'message': 'Funds added successfully',
            'wallet': WalletSerializer(wallet).data
        }, status=status.HTTP_200_OK)
