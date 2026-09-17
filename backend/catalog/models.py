from django.db import models

class CatalogItem(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    # Customs & Freight Extensions
    hs_code = models.CharField(max_length=20, help_text="Harmonized System Code for Customs Tariff")
    unit_weight_kg = models.DecimalField(max_digits=8, decimal_places=3, help_text="Net weight per unit in kg")
    # dimensions_cm = models.CharField(max_length=50, placeholder="L x W x H in cm", blank=True, null=True)
    dimensions_cm = models.CharField(max_length=50, blank=True, null=True)
    packages_count = models.IntegerField(default=1, help_text="Default number of outer packages/cartons")

    def __str__(self):
        return f"{self.sku} - {self.name}"