# Branch: fix/edit-model-alignment

## Current Status
- [x] Refactored `PurchaseOrderList` and `PurchaseOrderRow` to display expanded line items.
- [x] Re-added itemized dropdown arrow (`►`/`▼`) next to PO Numbers.
- [x] Stubbed initial Edit Modal structure inside component.

## Next Steps / Pending Issues to Fix
1. **Header Alignment**: Adjust `<th>` for Actions to `text-align: center` and ensure min-width prevent wrapping.
2. **Action Buttons**: Apply `flexbox` layout (`display: flex; gap: 8px`) to `<td>` so `EDIT` and `CANCEL` sit horizontally side-by-side instead of stacking vertically.
3. **Edit Modal Integration**:
   - Verify modal backdrop overlay covers the viewport cleanly.
   - Wire up `PUT`/`PATCH` API request handler to update PO fields in Django backend.
   - Ensure closing modal triggers a re-fetch/refresh of `PurchaseOrderList`.

## Reference Notes
- Edit modal template is currently drafted inside `PurchaseOrderRow.jsx`.