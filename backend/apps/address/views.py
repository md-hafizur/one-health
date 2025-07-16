from rest_framework import generics
from .models import Division, Zilla, Upazila, Union, Village, Para, PostOffice
from .serializers import (
    DivisionSerializer, ZillaSerializer, UpazilaSerializer,
    UnionSerializer, VillageSerializer, ParaSerializer, PostOfficeSerializer
)

# Division (no filtering needed)
class DivisionListCreateView(generics.ListCreateAPIView):
    queryset = Division.objects.all()
    serializer_class = DivisionSerializer


# Zilla (filter by division)
class ZillaListCreateView(generics.ListCreateAPIView):
    serializer_class = ZillaSerializer

    def get_queryset(self):
        queryset = Zilla.objects.all()
        division_id = self.request.query_params.get('division')
        if division_id:
            queryset = queryset.filter(division_id=division_id)
        return queryset


# Upazila (filter by zilla)
class UpazilaListCreateView(generics.ListCreateAPIView):
    serializer_class = UpazilaSerializer

    def get_queryset(self):
        queryset = Upazila.objects.all()
        zilla_id = self.request.query_params.get('zilla')
        if zilla_id:
            queryset = queryset.filter(zilla_id=zilla_id)
        return queryset


# Union (filter by upazila)
class UnionListCreateView(generics.ListCreateAPIView):
    serializer_class = UnionSerializer

    def get_queryset(self):
        queryset = Union.objects.all()
        upazila_id = self.request.query_params.get('upazila')
        if upazila_id:
            queryset = queryset.filter(upazila_id=upazila_id)
        return queryset

# PostOffice (filter by union)
class PostOfficeListCreateView(generics.ListCreateAPIView):
    serializer_class = PostOfficeSerializer

    def get_queryset(self):
        queryset = PostOffice.objects.all()
        union_id = self.request.query_params.get('union')
        if union_id:
            queryset = queryset.filter(union_id=union_id)
        return queryset


# Village (filter by union)
class VillageListCreateView(generics.ListCreateAPIView):
    serializer_class = VillageSerializer

    def get_queryset(self):
        queryset = Village.objects.all()
        union_id = self.request.query_params.get('union')
        if union_id:
            queryset = queryset.filter(union_id=union_id)
        return queryset


# Para (filter by village)
class ParaListCreateView(generics.ListCreateAPIView):
    serializer_class = ParaSerializer

    def get_queryset(self):
        queryset = Para.objects.all()
        village_id = self.request.query_params.get('village')
        if village_id:
            queryset = queryset.filter(village_id=village_id)
        return queryset


# Division
class DivisionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Division.objects.all()
    serializer_class = DivisionSerializer

# Zilla
class ZillaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Zilla.objects.all()
    serializer_class = ZillaSerializer

# Upazila
class UpazilaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Upazila.objects.all()
    serializer_class = UpazilaSerializer

# Union
class UnionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Union.objects.all()
    serializer_class = UnionSerializer

# PostOffice
class PostOfficeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PostOffice.objects.all()
    serializer_class = PostOfficeSerializer

# Village
class VillageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Village.objects.all()
    serializer_class = VillageSerializer

# Para
class ParaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Para.objects.all()
    serializer_class = ParaSerializer