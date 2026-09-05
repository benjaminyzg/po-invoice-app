import React, { useState, useEffect } from 'react';
import { quotationService } from '../services/quotationService';
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

  useEffect(() => {
    Promise.all([
      quotationService.getPaymentTerms(),
      quotationService.getCatalogItems()
    ])
      .then(([terms, items]) => {
        setPaymentTerms(terms);
        setCatalogItems(items);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading form dependencies:", err);
        setLoading(false);
      });
  }, []);

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
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden my-6 border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">New Quotation Generator</h2>
        <span className="text-xs bg-blue-500/30 px-3 py-1 rounded-full uppercase tracking-wider font-medium">Master Catalog Linked</span>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Client & Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Client Name</label>
            <input 
              type="text" 
              placeholder="e.g., Acme Corporation"
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)} 
              required 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Valid Until</label>
            <input 
              type="date" 
              value={validUntil} 
              onChange={(e) => setValidUntil(e.target.value)} 
              required 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Term Template</label>
            <select 
              value={selectedPaymentTerm} 
              onChange={(e) => setSelectedPaymentTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="">Select Terms...</option>
              {paymentTerms.map(term => (
                <option key={term.id} value={term.id}>{term.name} ({term.due_days} Days)</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Line Items Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold text-gray-800">Line Items & Pricing</h3>
            <button 
              type="button" 
              onClick={addItemRow} 
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg transition"
            >
              + Add Line Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <select 
                    value={item.catalog_item} 
                    onChange={(e) => handleItemChange(index, 'catalog_item', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 bg-white text-sm"
                  >
                    <option value="">Select Catalog Item...</option>
                    {catalogItems.map(ci => (
                      <option key={ci.id} value={ci.id}>{ci.name} (${ci.unit_price})</option>
                    ))}
                  </select>
                </div>
                
                <div className="w-24">
                  <input 
                    type="number" 
                    placeholder="Qty" 
                    value={item.quantity} 
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-center"
                  />
                </div>

                <div className="w-32">
                  <input 
                    type="number" 
                    placeholder="Unit Price" 
                    value={item.unit_price} 
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    step="0.01"
                    required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white font-mono"
                  />
                </div>

                <div className="w-24 text-right font-mono text-sm font-semibold text-gray-700">
                  ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
                </div>

                {items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeItemRow(index)}
                    className="text-red-500 hover:text-red-700 p-1 text-sm font-bold"
                    title="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total & Actions Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-lg font-bold text-gray-900">
            Total Amount: <span className="text-blue-600 font-mono">${calculateTotal()}</span>
          </div>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={handleExportPDF}
              className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition"
            >
              Export to PDF
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition"
            >
              Save & Issue Quotation
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}