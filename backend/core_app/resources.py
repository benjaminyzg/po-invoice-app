from import_export import resources
from .models import CatalogItem

class CatalogItemResource(resources.ModelResource):
    class Meta:
        model = CatalogItem
        import_id_fields = ('sku',)  # Uses SKU as primary key for creates/updates
        fields = ('sku', 'name', 'category', 'unit_price', 'description')