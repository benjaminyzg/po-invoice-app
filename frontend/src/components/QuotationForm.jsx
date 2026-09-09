import React, { useState, useEffect } from 'react';
import { quotationService } from '../services/quotationService';
import CardContainer from './common/CardContainer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const inputStyle = {
  padding: '10px 12px',       // Increases the input box height/size
  fontSize: '16px',           // Increases the text font size
  width: '100%',
  borderRadius: '4px',
  border: '1px solid #ccc',
  marginBottom: '12px'
};

export default function QuotationForm() {
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState('');
  const [items, setItems] = useState([{ catalog_item: '', quantity: 1, unit_price: '' }]);
  const [formData, setFormData] = useState({ 
    client_contact_person: '',
    client_email: '',
    client_phone_number: '',
    client_postal_code: '',
    client_billing_address: ''
  });
  const [quotations, setQuotations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);

  const filteredQuotations = quotations.filter(q => {
    if (filter === 'All') return true;
    return q.status?.toLowerCase() === filter.toLowerCase();
  });

  useEffect(() => {
  Promise.all([
    quotationService.getPaymentTerms(),
    quotationService.getCatalogItems(),
    quotationService.getQuotations()
  ])
  .then(([terms, items, quotationsRes]) => {
    setPaymentTerms(terms);
    setCatalogItems(items);
    
    // Safely extract the array whether it's paginated or a plain array
    const data = quotationsRes.data || quotationsRes;
    const rawList = Array.isArray(data) ? data : (data.results || []);
    // Deduplication check
    const uniqueList = rawList.filter((item, index, self) =>
    index === self.findIndex((t) => (
        t.client_name === item.client_name && t.valid_until === item.valid_until
      ))
    );
    setQuotations(uniqueList);
    setLoading(false); // Stops the loading screen!
    }) // <--- Make sure the .then() block closes here!
    .catch(err => {
      console.error("Error loading form data:", err);
      setLoading(false); // Ensures loading stops even if an error occurs
    });
  }, []);
  // Fetch history when the form page loads (or after a successful submit)
  const fetchQuotations = async () => {
  try {
    const response = await quotationService.getQuotations();
    const data = response.data || response;
    const rawList = Array.isArray(data) ? data : (data.results || []);

    const uniqueList = rawList.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.client_name === item.client_name && t.valid_until === item.valid_until
      ))
    );

    setQuotations(uniqueList);
  } catch (error) {
    console.error("Error fetching quotations:", error);
  }
};
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // If selecting a catalog item, auto-populate the standard master unit price
    if (field === 'catalog_item') {
      const selectedCatalog = catalogItems.find(ci => ci.id === parseInt(value));
      if (selectedCatalog) {
        newItems[index].unit_price = selectedCatalog.unit_price;
      }
    }
    setItems(newItems);
  };
  const addItemRow = () => {
    setItems([...items, { catalog_item: '', quantity: 1, unit_price: '' }]);
  };
  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };
  // Calculate live total amount
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + (qty * price);
    }, 0).toFixed(2);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing record
        await quotationService.updateQuotation(editingId, formData);
        alert("Quotation updated successfully!");
        setEditingId(null);
      } else {
        // Create new record
        await quotationService.createQuotation(formData);
        alert("Quotation created successfully!");
      }

      // Reset form and refresh list
      setEditingId(null);
      // call fetchQuotations() here if you have it scoped, or reload data
    } catch (error) {
      console.error("Error submitting quotation form:", error);
    }
  };
  
  const handleExportPDF = () => {
    if (!clientName || !validUntil || items.some(i => !i.catalog_item)) {
      alert("Please complete client name, validity date, and select catalog items before exporting to PDF.");
      return;
    }

    const doc = new jsPDF();
    
    // Header Styling
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text("QUOTATION", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Valid Until: ${validUntil}`, 14, 35);
    doc.text(`Client: ${clientName}`, 14, 40);

    const termObj = paymentTerms.find(t => t.id.toString() === selectedPaymentTerm.toString());
    if (termObj) {
      doc.text(`Payment Terms: ${termObj.name} (${termObj.due_days} Days)`, 14, 45);
    }

    const tableRows = items.map(item => {
      const catalogObj = catalogItems.find(ci => ci.id.toString() === item.catalog_item.toString());
      const itemName = catalogObj ? catalogObj.name : 'Custom Item';
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const lineTotal = (qty * price).toFixed(2);

      return [itemName, qty, `$${price.toFixed(2)}`, `$${lineTotal}`];
    });

    doc.autoTable({
      startY: 55,
      head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const grandTotal = calculateTotal();
    
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    doc.text(`Grand Total: $${grandTotal}`, 14, finalY);

    doc.save(`Quotation_${clientName.replace(/\s+/g, '_')}.pdf`);
  };
  // 1. Delete Handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await quotationService.deleteQuotation(id);
        // Immediately filter out the deleted record from local state
        setQuotations(quotations.filter(q => q.id !== id));
      } catch (error) {
        console.error("Error deleting quotation:", error);
      }
    }
  };
  // 2. Edit Handler (Populates the form with existing record data)
  const handleEdit = (quotation) => {
    setEditingId(quotation.id);
    setClientName(quotation.client_name || '');
    setValidUntil(quotation.valid_until || '');
    setSelectedPaymentTerm(quotation.payment_term || '');
    setItems(quotation.items || []);
    // Populate any other relevant form fields here as needed
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  };
  // 3. View / Export Handler
  const handleViewExport = (quotation) => {
    console.log("Viewing/Exporting quotation:", quotation);
    // You can trigger a PDF modal or window open route here
    alert(`Exporting quotation for: ${quotation.client_name}`);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading quotation workspace...</div>;
  }
  return (
    <CardContainer title="Quotation Form">
    <div className="p-8 space-y-6 bg-white w-full box-border">
    {/* Top Header Bar */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Quotation Details</h3>
        <p className="text-sm text-gray-500 mt-1">Create professional quotations linked with master catalog pricing.</p>
      </div>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm whitespace-nowrap">
        Master Catalog Linked
      </span>
    </div>

    <form onSubmit={handleSubmit} className="space-y-8">
  
    {/* General Metadata Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
  <label>Client Name *</label>
  <input 
    type="text" 
    value={formData.client_name} 
    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
    style={inputStyle}
    placeholder="e.g., Acme Corporation"
  />
</div>
        <div>
  <label>Valid Until *</label>
  <input 
    type="date" 
    value={formData.valid_until} 
    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
    style={inputStyle}
  />
</div>
        <div>
  <label>Payment Term Template</label>
  <select 
    value={formData.payment_term} 
    onChange={(e) => setFormData({...formData, payment_term: e.target.value})}
    style={inputStyle}
  >
    <option value="">Select Terms...</option>
    {paymentTerms.map(term => (
      <option key={term.id} value={term.id}>{term.name}</option>
    ))}
  </select>
</div>
    </div>

    {/* Client Detailed Billing Information Section (2x2 Grid) */}
    <div className="w-full border border-gray-300 rounded-lg p-4 text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Client Billing Details</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Contact Person</label>
          <input 
            type="text" 
            placeholder="e.g., John Doe" 
            value={formData.client_contact_person || ""} 
            onChange={(e) => setFormData({...formData, client_contact_person: e.target.value})} 
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
          <input 
            type="email" 
            placeholder="client@example.com" 
            value={formData.client_email || ""} 
            onChange={(e) => setFormData({...formData, client_email: e.target.value})} 
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Office / Tel Number</label>
          <input 
            type="text" 
            placeholder="e.g., +65 6123 4567" 
            value={formData.client_phone_number || ""} 
            onChange={(e) => setFormData({...formData, client_phone_number: e.target.value})} 
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Postal Code</label>
          <input 
            type="text" 
            placeholder="e.g., 123456" 
            value={formData.client_postal_code || ""} 
            onChange={(e) => setFormData({...formData, client_postal_code: e.target.value})} 
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>
      </div>
      <div className="w-full">
        <label className="block text-sm font-bold text-slate-800 mb-1.5">Full Billing Address</label>
        <textarea 
          placeholder="Enter full street address..." 
          rows="2"
          value={formData.client_billing_address || ""} 
          onChange={(e) => setFormData({...formData, client_billing_address: e.target.value})} 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
        />
      </div>
    </div>
    </form>
    
    {/* Quotation History Section */}
    <h3>Recent Quotation Records</h3>
    {/* Table matching Invoice Records format */}
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <thead>
  <tr>
    <th style={{ textAlign: 'center' }}>Quote #</th>
    <th>Client Name</th>
    <th style={{ textAlign: 'center' }}>Valid Until</th>
    <th style={{ textAlign: 'center' }}>Status</th>
    <th style={{ textAlign: 'center' }}>Actions</th>
  </tr>
</thead>
<tbody>
  {filteredQuotations.map((q) => (
    <tr key={q.id}>
      <td style={{ textAlign: 'center' }}>{q.quotation_number || `Q-${q.id}`}</td>
      <td>{q.client_name}</td>
      <td style={{ textAlign: 'center' }}>{q.valid_until}</td>
      <td style={{ textAlign: 'center' }}>{q.status || 'DRAFT'}</td>
      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
        <button 
          onClick={() => handleEdit(q)} 
          style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', marginRight: '4px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Edit
        </button>
        <button 
          onClick={() => handleDelete(q.id)} 
          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', marginRight: '4px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Delete
        </button>
        <button 
          onClick={() => handleViewExport(q)} 
          style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
        >
          View/Export
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  </CardContainer>
);
}