from django.db import models

class Division(models.Model):
    name_bn = models.CharField(max_length=100, unique=True)
    name_en = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name_en


class Zilla(models.Model):
    name_bn = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='zillas')

    class Meta:
        unique_together = ('name_en', 'division')  # Same-named zilla can exist in different divisions

    def __str__(self):
        return self.name_en


class Upazila(models.Model):
    name_bn = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    zilla = models.ForeignKey(Zilla, on_delete=models.CASCADE, related_name='upazilas')

    class Meta:
        unique_together = ('name_en', 'zilla')

    def __str__(self):
        return self.name_en


class Union(models.Model):
    name_bn = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    upazila = models.ForeignKey(Upazila, on_delete=models.CASCADE, related_name='unions')

    class Meta:
        unique_together = ('name_en', 'upazila')

    def __str__(self):
        return self.name_en

class PostOffice(models.Model):
    name = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    union = models.ForeignKey('Union', on_delete=models.CASCADE, related_name='post_offices')

    class Meta:
        unique_together = ('name', 'union')

    def __str__(self):
        return f"{self.name} ({self.postal_code})"


class Village(models.Model):
    name_bn = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    union = models.ForeignKey("Union", on_delete=models.CASCADE, related_name="villages")

    def __str__(self):
        return self.name_en


class Para(models.Model):
    name_bn = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    village = models.ForeignKey("Village", on_delete=models.CASCADE, related_name="paras")

    def __str__(self):
        return self.name_en


class Address(models.Model):
    division = models.ForeignKey(Division, on_delete=models.SET_NULL, null=True)
    zilla = models.ForeignKey(Zilla, on_delete=models.SET_NULL, null=True)
    upazila = models.ForeignKey(Upazila, on_delete=models.SET_NULL, null=True)
    union = models.ForeignKey(Union, on_delete=models.SET_NULL, null=True)
    post_office = models.ForeignKey(PostOffice, on_delete=models.SET_NULL, null=True)
    village = models.ForeignKey(Village, on_delete=models.SET_NULL, null=True)
    para = models.ForeignKey(Para, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.para}, {self.village}, {self.union}, {self.upazila}, {self.zilla}, {self.division}"
