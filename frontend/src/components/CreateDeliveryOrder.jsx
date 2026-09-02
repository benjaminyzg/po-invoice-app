import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import api from '../services/api';

export default function CreateDeliveryOrder({ invoiceId }) {
  const sigCanvasRef = useRef(null);
  const [formData, setFormData] = React.useState({
    carrier_name: '',
    consignment_note_number: '',
    sender_address: '',
    consignee_address: '',
    recipient_name: '',
  });

  const handleClearSignature = () => {
    sigCanvasRef.current.clear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert signature drawing to Base64 image string
    const signatureDataURL = sigCanvasRef.current.isEmpty() 
      ? null 
      : sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');

    const payload = {
      ...formData,
      invoice: invoiceId,
      recipient_signature_data: signatureDataURL,
    };

    try {
      await api.post('/delivery-orders/', payload);
      alert('Delivery Order created successfully!');
    } catch (err) {
      console.error('Failed to generate DO:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow">
      <h3 className="text-lg font-bold">Generate Delivery Order (DO)</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Carrier Name (e.g. DHL)"
          value={formData.carrier_name}
          onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Consignment Note / Waybill No."
          value={formData.consignment_note_number}
          onChange={(e) => setFormData({ ...formData, consignment_note_number: e.target.value })}
          className="border p-2 rounded"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <textarea
          placeholder="Sender Address"
          value={formData.sender_address}
          onChange={(e) => setFormData({ ...formData, sender_address: e.target.value })}
          className="border p-2 rounded h-24"
          required
        />
        <textarea
          placeholder="Consignee Address"
          value={formData.consignee_address}
          onChange={(e) => setFormData({ ...formData, consignee_address: e.target.value })}
          className="border p-2 rounded h-24"
          required
        />
      </div>

      <div className="border p-3 rounded bg-gray-50">
        <label className="block text-sm font-medium mb-1">Recipient Name & Signature</label>
        <input
          type="text"
          placeholder="Recipient Printed Name"
          value={formData.recipient_name}
          onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
          className="border p-2 rounded w-full mb-2"
        />
        
        <div className="border bg-white rounded">
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor="black"
            canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }}
          />
        </div>
        <button
          type="button"
          onClick={handleClearSignature}
          className="mt-2 text-xs text-red-600 underline"
        >
          Clear Signature
        </button>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save & Issue Delivery Order
      </button>
    </form>
  );
}