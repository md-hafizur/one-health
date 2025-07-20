# apps/address/serializers.py

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Division, Zilla, Upazila, Union, Village, Para, PostOffice, Address
from apps.accounts.models import UserProfile, User

class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ['id', 'name_bn', 'name_en']

class ZillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zilla
        fields = ['id', 'name_bn', 'name_en', 'division']

class UpazilaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upazila
        fields = ['id', 'name_bn', 'name_en', 'zilla']

class UnionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Union
        fields = ['id', 'name_bn', 'name_en', 'upazila']

class VillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Village
        fields = ['id', 'name_bn', 'name_en', 'union']

class ParaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Para
        fields = ['id', 'name_bn', 'name_en', 'village']

class PostOfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostOffice
        fields = ['id', 'name', 'postal_code', 'union']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'phone', 'role']

class UserProfileSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    account_type = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user',
            'name_en', 'name_bn',
            'phone', 'gurdian_phone',
            'nid', 'guardian_nid',
            'father_name_en', 'father_name_bn',
            'mother_name_en', 'mother_name_bn',
            'spouse_name_en', 'spouse_name_bn',
            'occupation', 'blood_group',
            'data_of_birth', 'email',
            'address', 'photo', 'signature', 'account_type'
        ]

    def validate(self, data):
        phone = data.get('phone')
        email = data.get('email')
        account_type = data.get('account_type') 

        if account_type != "sub-account":
            if not phone and not email:
                raise ValidationError("Either phone or email must be provided.")

        return data

    def create(self, validated_data):
        address_data = validated_data.pop('address', None)
        account_type = validated_data.pop('account_type')
        if account_type !='sub-account':
            address = Address.objects.create(**address_data)
            profile = UserProfile.objects.create(address=address, **validated_data)
        else:
            profile = UserProfile.objects.create(**validated_data)
        return profile

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', None)

        if address_data:
            address = instance.address
            if address:
                for attr, value in address_data.items():
                    setattr(address, attr, value)
                address.save()
            else:
                address = Address.objects.create(**address_data)
                instance.address = address

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
