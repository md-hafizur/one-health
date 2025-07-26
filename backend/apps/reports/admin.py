from django.contrib import admin

# Register your models here.
from .models import ReportDepartment, Prescription, Report
@admin.register(ReportDepartment)
class ReportDepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)
    list_filter = ('parent',)
@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'created_at')
    search_fields = ('patient__username', 'doctor__username')
    list_filter = ('created_at',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('department', 'value', 'unit')
    search_fields = ('department__name', 'value', 'unit')
    list_filter = ('department',)
