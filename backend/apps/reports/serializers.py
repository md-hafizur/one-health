from rest_framework import serializers
from .models import ReportDepartment, Report # Assuming these models are in the same app or correctly imported

# 1. Report Serializer (remains the same)
class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'value', 'unit', 'range_min', 'range_max', 'range_unit', 'context']

# 2. ReportDepartmentSerializer (now self-referential for children)
class ReportDepartmentSerializer(serializers.ModelSerializer):
    reports = ReportSerializer(many=True, read_only=True)
    # Use SerializerMethodField for children to handle self-referencing
    children = serializers.SerializerMethodField()

    class Meta:
        model = ReportDepartment
        fields = ['id', 'name', 'reports', 'children']

    def get_children(self, obj):
        # This method will be called to get the children of the current department.
        # It recursively calls the same serializer for each child.
        # We pass self.context to ensure the serializer has access to any context
        # (like the request object) that might be needed by nested serializers.
        children_queryset = obj.children.all()
        return ReportDepartmentSerializer(children_queryset, many=True, context=self.context).data

# 3. ParentDepartmentSerializer (optional, if you only want top-level departments)
# This serializer is essentially the same as the self-referential ReportDepartmentSerializer
# but explicitly used for fetching only the top-level departments.
class ParentDepartmentSerializer(ReportDepartmentSerializer):
    # No additional fields needed here, it inherits the recursive behavior
    # from ReportDepartmentSerializer.
    pass