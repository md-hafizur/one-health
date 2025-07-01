# import re
# from django.core.exceptions import ValidationError

# class PhoneValidator:
#     def __init__(self, message=None):
#         self.message = message or "Phone number must be exactly 11 digits."

#     def __call__(self, value):
#         if not re.fullmatch(r'\d{11}', value):
#             raise ValidationError(self.message)

from django.core.exceptions import ValidationError
import re

def phone_validator(value):
    if not re.fullmatch(r'\d{11}', value):
        raise ValidationError("Phone number must be exactly 11 digits.")
