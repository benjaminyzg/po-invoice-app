export default function InvoiceSummary({
  remarks,
  setRemarks,
  grandTotal,
  isEditing
}) {
  return (
    <div style={{ marginTop: '30px' }}>
      {/* 1. Top Horizontal Line */}
      <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '20px 0' }} />

      {/* Grand Total Display */}
      <div style={{ textAlign: 'right', fontSize: '15px', fontWeight: 'bold', marginBottom: '20px' }}>
        Grand Total: ${grandTotal.toFixed(2)}
      </div>
      
      {/* Remarks Field */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '15px', textAlign: 'left'}}>
          Remarks / Notes:
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter any remarks or notes..."
          rows="3"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      </div>

      {/* Submit / Update Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {isEditing ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
}