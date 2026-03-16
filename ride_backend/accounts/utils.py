from django.conf import settings
from twilio.rest import Client


def send_otp_sms(phone_number, otp_code):
    """
    Send OTP via SMS using Twilio
    Returns: (success: bool, message: str)
    """
    try:
        # Check if Twilio credentials are configured
        if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
            # For development/testing, just log the OTP
            print(f"[DEV MODE] OTP for {phone_number}: {otp_code}")
            return True, "OTP sent (dev mode)"
        
        # Initialize Twilio client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        # Send SMS
        message = client.messages.create(
            body=f"Your RideShare verification code is: {otp_code}. Valid for 10 minutes.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=str(phone_number)
        )
        
        return True, f"OTP sent successfully. SID: {message.sid}"
    
    except Exception as e:
        return False, str(e)


def send_notification_email(user, subject, message):
    """
    Send notification email to user
    """
    from django.core.mail import send_mail
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
