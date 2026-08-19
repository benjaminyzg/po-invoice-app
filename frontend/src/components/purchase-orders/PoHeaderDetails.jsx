export default function PoHeaderDetails({
  poNumber,
  vendor,
  setVendor,
  costCentre,
  setCostCentre,
  status,
  setStatus
}) {
  const fieldStyle = {
    width: '100%',
    height: '38px',
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '14px'
  };

  const labelStyle = {
    display: 'block',
    textAlign: 'center',
    marginBottom: '5px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {/* Row 1: PO Number, Vendor Name, Status */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>PO Number</label>
          <input
            type="text"
            value={poNumber || ''}
            placeholder="Auto-generated on save"
            disabled
            style={{
              ...fieldStyle,
              backgroundColor: '#f0f0f0',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Vendor Name</label>
          <input
            type="text"
            value={vendor || ''}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Vendor Name"
            style={fieldStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <select
            value={status || 'PENDING'}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              ...fieldStyle,
              backgroundColor: '#fff'
            }}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RECEIVED">Received</option>
          </select>
        </div>
      </div>

      {/* Row 2: Cost Centre */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Cost Centre</label>
          <input
            type="text"
            value={costCentre || ''}
            onChange={(e) => setCostCentre(e.target.value)}
            placeholder="e.g. CC-1002"
            style={fieldStyle}
          />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}