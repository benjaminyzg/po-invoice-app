import ExportPdfButton from '../common/ExportPdfButton';

// Inside your component layout:
return (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <h2>Invoice Details</h2>
      <ExportPdfButton elementId="invoice-export-area" fileName="Invoice-Record.pdf" />
    </div>

    {/* The targeted container that will be exported to PDF */}
    <div id="invoice-export-area" style={{ padding: '20px', backgroundColor: '#fff' }}>
      {/* Existing invoice content/tables here */}
    </div>
  </div>
);