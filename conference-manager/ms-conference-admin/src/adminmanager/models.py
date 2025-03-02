from django.db import models
from django.conf import settings


class Headquarter(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    website = models.URLField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    #created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    #updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'Headquarters'
        db_table = 'headquarters'
        managed = False

    def __str__(self):
        return self.name
