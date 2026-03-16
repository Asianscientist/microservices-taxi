from django.urls import path
from .views import (
    CreatePaymentView,
    PaymentListView,
    PaymentDetailView,
    DriverPayoutsView,
    RequestPayoutView,
    RefundListView,
    WalletView,
    WalletTransactionsView,
    AddWalletFundsView,
)

app_name = 'payments'

urlpatterns = [
    # Payments
    path('create/', CreatePaymentView.as_view(), name='create_payment'),
    path('', PaymentListView.as_view(), name='payments'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
    
    # Payouts
    path('payouts/', DriverPayoutsView.as_view(), name='payouts'),
    path('payouts/<uuid:payout_id>/process/', RequestPayoutView.as_view(), name='process_payout'),
    
    # Refunds
    path('refunds/', RefundListView.as_view(), name='refunds'),
    
    # Wallet
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('wallet/transactions/', WalletTransactionsView.as_view(), name='wallet_transactions'),
    path('wallet/add-funds/', AddWalletFundsView.as_view(), name='add_funds'),
]
