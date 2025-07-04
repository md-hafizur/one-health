# apps/address/serializers.py

from rest_framework import serializers
from .models import Division, Zilla, Upazila, Union, Village, Para

class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ['id', 'name']

class ZillaSerializer(serializers.ModelSerializer):
    division = DivisionSerializer(read_only=True)
    class Meta:
        model = Zilla
        fields = ['id', 'name', 'division']

class UpazilaSerializer(serializers.ModelSerializer):
    zilla = ZillaSerializer(read_only=True)
    class Meta:
        model = Upazila
        fields = ['id', 'name', 'zilla']

class UnionSerializer(serializers.ModelSerializer):
    upazila = UpazilaSerializer(read_only=True)
    class Meta:
        model = Union
        fields = ['id', 'name', 'upazila']

class VillageSerializer(serializers.ModelSerializer):
    union = UnionSerializer(read_only=True)
    class Meta:
        model = Village
        fields = ['id', 'name', 'union']

class ParaSerializer(serializers.ModelSerializer):
    village = VillageSerializer(read_only=True)
    class Meta:
        model = Para
        fields = ['id', 'name', 'village']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'phone', 'role']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    address = ParaSerializer(read_only=True)
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Para.objects.all(),
        source='address',
        write_only=True
    )
    full_address_string = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'address', 'address_id', 'full_address_string'
        ]

    def get_full_address_string(self, obj):
        if not obj.address:
            return ""
        para = obj.address
        village = para.village if para else None
        union = village.union if village else None
        upazila = union.upazila if union else None
        zilla = upazila.zilla if upazila else None
        division = zilla.division if zilla else None

        parts = [
            para.name if para else '',
            village.name if village else '',
            union.name if union else '',
            upazila.name if upazila else '',
            zilla.name if zilla else '',
            division.name if division else '',
        ]
        return ', '.join(filter(None, parts))

