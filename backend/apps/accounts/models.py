from django.contrib.auth.models import AbstractUser
from core.utils.modeler import BaseModel
from django.db import models
from django.db.models import Q
from apps.address.models import Address
from core.validators import phone_validator

class Role(BaseModel):
    name = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100) 

    def __str__(self):
        return self.label


class User(AbstractUser, BaseModel):
    phone = models.CharField(
        max_length=11,
        validators=[phone_validator],
        unique=False,
        null=True,
        blank=True,
    )

    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True)

    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children'
    )
    username = models.CharField(
        max_length=150,
        unique=True,
        null=True,
        blank=True,
    )

    addBy = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='added_by'
    )

    rejected = models.BooleanField(default=False)

    rejected_by = models.ForeignKey(
        "self",
        related_name="user_rejected_by",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    rejected_at = models.DateTimeField(null=True, blank=True)

    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)

    email_code = models.CharField(max_length=6, null=True, blank=True)
    phone_code = models.CharField(max_length=6, null=True, blank=True)

    payment_status = models.CharField(max_length=10, choices=[('Paid', 'Paid'), ('Pending', 'Pending'), ('Failed', 'Failed')], default='Pending')
    approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        "self",
        related_name="user_approved_by",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    sub_account_status = models.CharField(
        max_length=10,
        choices=[
            ('Draft', 'Draft'),
            ('Active', 'Active'),
            ('Inactive', 'Inactive')
        ],
        blank=True,
        null=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                condition=Q(parent__isnull=True) & ~Q(email__isnull=True) & ~Q(email=''),
                name='unique_main_email'
            ),
            models.UniqueConstraint(
                fields=['phone'],
                condition=Q(parent__isnull=True) & ~Q(phone__isnull=True) & ~Q(phone=''),
                name='unique_main_phone'
            ),
        ]

    def __str__(self):
        return self.username or self.email or self.phone or f"User-{self.pk}"


class UserProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Core profile
    name_en = models.CharField(max_length=100)
    name_bn = models.CharField(max_length=100)

    phone = models.CharField(
        max_length=11,
        validators=[phone_validator],
        unique=False,
        null=True,
        blank=True,
    )
    gurdian_phone = models.CharField(max_length=11, validators=[phone_validator], blank=True, null=True)
    gurdian_email = models.EmailField(blank=True, null=True)
    # relationship chicoe like son, daughter, etc
    relationship = models.CharField(max_length=100, choices=[('Son', 'Son'), ('Daughter', 'Daughter'), ('Brother', 'Brother'), ('Sister', 'Sister'), ('Other', 'Other')], blank=True, null=True)

    nid = models.CharField(max_length=17, blank=True, null=True)
    guardian_nid = models.CharField(max_length=17, blank=True, null=True)

    # Parents/Spouse Info
    father_name_en = models.CharField(max_length=100, blank=True, null=True)
    father_name_bn = models.CharField(max_length=100, blank=True, null=True)

    mother_name_en = models.CharField(max_length=100, blank=True, null=True)
    mother_name_bn = models.CharField(max_length=100, blank=True, null=True)

    spouse_name_en = models.CharField(max_length=100, blank=True, null=True)
    spouse_name_bn = models.CharField(max_length=100, blank=True, null=True)

    occupation = models.CharField(max_length=100, blank=True, null=True)

    blood_group = models.CharField(max_length=3, choices=[('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-')], blank=True, null=True)
    data_of_birth = models.DateField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    # Address
    address = models.OneToOneField(Address, on_delete=models.SET_NULL, null=True, blank=True)

    photo = models.ImageField(upload_to='photos/', blank=True, null=True)
    signature = models.ImageField(upload_to='signatures/', blank=True, null=True)

    def __str__(self):
        return f"{self.name_en} / {self.name_bn}"

    


    @property
    def para(self):
        return self.address

    @property
    def village(self):
        return self.para.village if self.para else None

    @property
    def upazila(self):
        return self.address.upazila if self.address else None

    @property
    def zilla(self):
        return self.upazila.zilla if self.upazila else None

    @property
    def division(self):
        return self.zilla.division if self.zilla else None