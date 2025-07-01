# class DivisionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Division
#         fields = ['name']

# class ZillaSerializer(serializers.ModelSerializer):
#     division = DivisionSerializer()
#     class Meta:
#         model = Zilla
#         fields = ['name', 'division']

# class UpazilaSerializer(serializers.ModelSerializer):
#     zilla = ZillaSerializer()
#     class Meta:
#         model = Upazila
#         fields = ['name', 'zilla']

# class UnionSerializer(serializers.ModelSerializer):
#     upazila = UpazilaSerializer()
#     class Meta:
#         model = Union
#         fields = ['name', 'upazila']

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'phone', 'role']

# class UserProfileSerializer(serializers.ModelSerializer):
#     address = UnionSerializer()
#     user = UserSerializer()
#     full_address_string = serializers.SerializerMethodField()

#     class Meta:
#         model = UserProfile
#         fields = ['user', 'address', 'full_address_string']

#     def get_full_address_string(self, obj):
#         return f"{obj.address.name}, {obj.upazila.name}, {obj.zilla.name}, {obj.division.name}"
