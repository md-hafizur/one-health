from django.core.mail import send_mail, send_mass_mail
from django.conf import settings


class EmailSender:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(EmailSender, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # For single email
        self.subject = None
        self.message = None
        self.recipient_list = []
        self.from_email = settings.DEFAULT_FROM_EMAIL

        # For bulk emails
        self.bulk_messages = []

    # ---- Chainable Setters for Single Email ----
    def set_subject(self, subject):
        self.subject = subject
        return self

    def set_message(self, message):
        self.message = message
        return self

    def set_recipients(self, recipients):
        if isinstance(recipients, str):
            recipients = [recipients]
        self.recipient_list = recipients
        return self

    def set_sender(self, from_email):
        self.from_email = from_email
        return self

    # ---- Add Bulk Email ----
    def add_bulk_email(self, subject, message, recipient_list, from_email=None):
        if isinstance(recipient_list, str):
            recipient_list = [recipient_list]
        self.bulk_messages.append((
            subject,
            message,
            from_email or self.from_email,
            recipient_list
        ))
        return self

    # ---- Send Single Email ----
    def __call__(self):
        if not self.subject or not self.message or not self.recipient_list:
            raise ValueError("Missing subject, message, or recipients for single email.")

        return send_mail(
            subject=self.subject,
            message=self.message,
            from_email=self.from_email,
            recipient_list=self.recipient_list,
            fail_silently=False
        )

    # ---- Send Bulk Emails ----
    def send_bulk(self):
        if not self.bulk_messages:
            raise ValueError("No bulk messages queued.")
        return send_mass_mail(tuple(self.bulk_messages), fail_silently=False)

    def __str__(self):
        return f"EmailSender(single to={self.recipient_list}, bulk={len(self.bulk_messages)} items)"



# how to use 
# usage in views.py or any file
# for single email
''' 
  #! For single email

    from utils.emailer import EmailSender

    def send_verification_email():
        EmailSender()\
            .set_subject("Verify Your Account")\
            .set_message("Click the link to verify your account.")\
            .set_recipients("user@example.com")\
            ()

'''

'''

    #! For bulk emails
    from utils.emailer import EmailSender

   def send_bulk_welcome_emails():
    emailer = EmailSender()
    
    emailer.add_bulk_email(
        subject="Welcome A",
        message="Hi A, here’s your onboarding guide.",
        recipient_list="a@example.com"
    ).add_bulk_email(
        subject="Welcome B",
        message="Hi B, you're invited!",
        recipient_list=["b@example.com", "b2@example.com"]
    )

    emailer.send_bulk()


'''
    
