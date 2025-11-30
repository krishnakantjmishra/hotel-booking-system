from django.db import models

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    address = models.TextField()
    rating = models.DecimalField(max_digits=2, decimal_places=1)  # example: 4.5
    price_min = models.DecimalField(max_digits=10, decimal_places=2)  # lowest price among rooms
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # newest first

    def __str__(self):
        return self.name
