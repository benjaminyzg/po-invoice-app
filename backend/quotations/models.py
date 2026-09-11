from django.db import models

class Quotation(models.Model):
    quotation_ref = models.CharField(max_length=50, unique=True)
    contact_person = models.CharField(max_length=255)
    contact_email = models.EmailField()
    mobile_number = models.CharField(max_length=30, blank=True, null=True)
    office_number = models.CharField(max_length=30, blank=True, null=True)
    entity_name = models.CharField(max_length=255)
    entity_address = models.TextField()
    entity_postal_code = models.CharField(max_length=20)
    incoterm = models.CharField(max_length=20, blank=True, null=True)
    payment_term = models.CharField(max_length=50, default='30 Days')
    validity_of_quotation = models.DateField()
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quotation_ref} - {self.entity_name}"