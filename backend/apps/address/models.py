from django.db import models

class Division(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Zilla(models.Model):
    name = models.CharField(max_length=100)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='zillas')

    class Meta:
        unique_together = ('name', 'division')  # Same-named zilla can exist in different divisions

    def __str__(self):
        return self.name


class Upazila(models.Model):
    name = models.CharField(max_length=100)
    zilla = models.ForeignKey(Zilla, on_delete=models.CASCADE, related_name='upazilas')

    class Meta:
        unique_together = ('name', 'zilla')

    def __str__(self):
        return self.name


class Union(models.Model):
    name = models.CharField(max_length=100)
    upazila = models.ForeignKey(Upazila, on_delete=models.CASCADE, related_name='unions')

    class Meta:
        unique_together = ('name', 'upazila')

    def __str__(self):
        return self.name
