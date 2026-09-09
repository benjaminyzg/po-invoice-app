import React, { useState, useEffect } from 'react';
import { quotationService } from '../services/quotationService';
import CardContainer from './common/CardContainer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const filteredQuotations = quotations.filter(q => {
    if (filter === 'All') return true;
    return q.status?.toLowerCase() === filter.toLowerCase();
  });

  // useEffect(() => {
  //   Promise.all([
  //     quotationService.getPaymentTerms(),
  //     quotationService.getCatalogItems()
  //   ])
  //     .then(([terms, items]) => {
  //       setPaymentTerms(terms);
  //       setCatalogItems(items);
  //       setLoading(false);
  //     })
  //     .catch(err => {
  //       console.error("Error loading form dependencies:", err);
  //       setLoading(false);
  //     });
  // }, []);

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
    const list = Array.isArray(data) ? data : (data.results || []);
    setQuotations(list);

    setLoading(false); // Stops the loading screen!
  })
  .catch(err => {
    console.error("Error loading form data:", err);
    setLoading(false); // Ensures loading stops even if an error occurs
  });
}, []);

  // Fetch history when the form page loads (or after a successful submit)
  const fetchQuotations = async () => {
    try {
      const data = await quotationService.getQuotations();
      setQuotations(data);
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
      const payload = {
        client_name: clientName,
        valid_until: validUntil,
        payment_term: selectedPaymentTerm || null,
        items: items.map(i => ({
          catalog_item: parseInt(i.catalog_item),
          quantity: parseInt(i.quantity),
          unit_price: parseFloat(i.unit_price)
        }))
      };

      const result = await quotationService.createQuotation(payload);
      alert(`Quotation #${result.id} successfully created!`);
    } catch (error) {
      console.error("Error creating quotation:", error.response?.data || error.message);
      alert("Failed to create quotation. Check console for validation details.");
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
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Client Name *</label>
          <input
            type="text"
            placeholder="e.g., Acme Corporation"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Valid Until *</label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Payment Term Template</label>
          <select
            value={selectedPaymentTerm}
            onChange={(e) => setSelectedPaymentTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          >
            <option value="">Select Terms...</option>
            {paymentTerms.map(term => (
              <option key={term.id} value={term.id}>{term.name} ({term.due_days} Days)</option>
            ))}
          </select>
        </div>
    </div>

    {/* Client Detailed Billing Information Section (2x2 Grid) */}
    <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-5 w-full">
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
        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
          <th style={{ padding: '12px' }}>Quotation #</th>
          <th style={{ padding: '12px' }}>Client Name</th>
          <th style={{ padding: '12px' }}>Valid Until</th>
          <th style={{ padding: '12px' }}>Status</th>
          <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredQuotations.map((q) => (
          <tr key={q.id} style={{ borderBottom: '1px solid #dee2e6' }}>
            <td style={{ padding: '12px', fontWeight: 'bold' }}>QT-{q.id}</td>
            <td style={{ padding: '12px' }}>{q.client_name}</td>
            <td style={{ padding: '12px' }}>{q.valid_until}</td>
            <td style={{ padding: '12px' }}>
              <span style={{ 
                background: '#fff3cd', 
                color: '#856404', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: 'bold' 
              }}>
                {q.status || 'DRAFT'}
              </span>
            </td>
           <td style={{ padding: '12px', textAlign: 'right' }}>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              <button onClick={() => handleEdit(q.id)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(q.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              <button onClick={() => handleView(q.id)} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>View / Export</button>
            </div>
          </td>         
        </tr>
          ))}
        </tbody>
      </table>
    </div>
  </CardContainer>
);
}