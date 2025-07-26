from django.db import models
from apps.accounts.models import User
from core.utils.modeler import BaseModel
from django.db.models import Q

# Create your models here.
class ReportDepartment(BaseModel):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        on_delete=models.SET_NULL
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_departments'
    )

    def __str__(self):
        return self.name


class Prescription(BaseModel):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_prescriptions',
        limit_choices_to=Q(role__name='doctor')
    )
    departments = models.ManyToManyField(ReportDepartment, related_name='prescriptions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Prescription #{self.id} for {self.patient.get_full_name()} by Dr. {self.doctor.get_full_name()}'


class Report(BaseModel):
    # name = models.CharField(max_length=100, null=True, blank=True)
    department = models.ForeignKey(
        ReportDepartment,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=50, null=True, blank=True)
    range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    range_unit = models.CharField(max_length=50, null=True, blank=True)
    context = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'Report for {self.department.name} - Value: {self.value} {self.unit if self.unit else ""}'

