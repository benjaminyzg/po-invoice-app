from django.db import transaction
from django.utils import timezone
from .models import DocumentSequence

def generate_serial_number(doc_type, prefix_str):
    """
    Safely generates a concurrent-proof sequential serialization code 
    by enforcing row-level transaction blocking.
    """
    current_year = timezone.now().year
    
    # CRITICAL CHECK 1: Must establish an explicit database transaction boundary
    with transaction.atomic():
        # CRITICAL CHECK 2: select_for_update() must lock the row to avoid duplicates
        seq_record, created = DocumentSequence.objects.select_for_update().get_or_create(
            doc_type=doc_type,
            year=current_year,
            defaults={'last_sequence': 0}
        )
        
        # Safely increment counter inside the locked transaction
        seq_record.last_sequence += 1
        seq_record.save()
        
        # CRITICAL CHECK 4: Format code safely with padded zeros matching your design
        # e.g., "INV-2026-0001" or "PO-2026-0001"
        return f"{prefix_str}-{current_year}-{seq_record.last_sequence:04d}"