import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import CardContainer from '../common/CardContainer';

const commonInputStyle = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '14px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '6px',
  textAlign: 'left'
};

const sectionTitleStyle = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'left'
};

export default function Settings({ token, baseUrl }) {
  const [formData, setFormData] = useState({
    company_name: '',
    tax_registration_no: '',
    registered_address: '',
    phone: '',
    email: '',
    website: '',
    bank_name: '',
    account_name: '',
    account_number: '',
    swift_code: '',
    paynow_uen: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token'); // or retrieve from AuthContext / props

    fetch(`${baseUrl}/company-settings/1/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data) {
          setFormData(data);
          if (data.logo) setLogoPreview(data.logo);
        }
      })
      .catch((err) => console.error('Error fetching settings:', err));
  }, [baseUrl]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('company_name', companyData.company_name);
    // Add other text fields...

    // Only append logo if a new file was selected
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/company-settings/1/', {
        method: 'PATCH', // or POST if creating
        headers: {
          'Authorization': `Bearer ${token}`, // Do NOT set Content-Type header manually; fetch/axios will set the multipart boundary automatically
        },
        body: formData,
      });
      const updatedSettings = await response.json();
      setCompanyData(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <CardContainer title="Company Settings & Branding">
      {message && (
        <div style={{ padding: '10px 14px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'left' }}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        {/* Section 1: Profile & Logo */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={sectionTitleStyle}>🏢 Company Profile & Logo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input type="text" name="company_name" value={formData.company_name || ''} onChange={handleChange} style={commonInputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Tax / UEN Registration No.</label>
              <input type="text" name="tax_registration_no" value={formData.tax_registration_no || ''} onChange={handleChange} style={commonInputStyle} placeholder="e.g. 201812345M" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Company Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', border: '1px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" style={{ maxHeight: '50px', maxWidth: '160px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e5e7eb', padding: '4px', backgroundColor: '#fff' }} />
              ) : (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>No logo uploaded</div>
              )}
              <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: '13px', color: '#374151' }} />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={sectionTitleStyle}>📍 Contact Details</h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Registered Address</label>
            <textarea name="registered_address" value={formData.registered_address || ''} onChange={handleChange} style={{ ...commonInputStyle, minHeight: '65px', resize: 'vertical' }} placeholder="Full street address, postal code..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} style={commonInputStyle} placeholder="+65 6123 4567" />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} style={commonInputStyle} placeholder="billing@company.com" />
            </div>
            <div>
              <label style={labelStyle}>Website</label>
              <input type="url" name="website" value={formData.website || ''} onChange={handleChange} style={commonInputStyle} placeholder="https://www.company.com" />
            </div>
          </div>
        </div>

        {/* Section 3: Banking Details */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={sectionTitleStyle}>💳 Banking & Payment Instructions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Bank Name</label>
              <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} style={commonInputStyle} placeholder="e.g. DBS Bank Ltd" />
            </div>
            <div>
              <label style={labelStyle}>Account Name</label>
              <input type="text" name="account_name" value={formData.account_name || ''} onChange={handleChange} style={commonInputStyle} placeholder="e.g. My Company Pte Ltd" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Account Number</label>
              <input type="text" name="account_number" value={formData.account_number || ''} onChange={handleChange} style={commonInputStyle} placeholder="120-901234-5" />
            </div>
            <div>
              <label style={labelStyle}>SWIFT / BIC Code</label>
              <input type="text" name="swift_code" value={formData.swift_code || ''} onChange={handleChange} style={commonInputStyle} placeholder="DBSSSGSG" />
            </div>
            <div>
              <label style={labelStyle}>PayNow UEN</label>
              <input type="text" name="paynow_uen" value={formData.paynow_uen || ''} onChange={handleChange} style={commonInputStyle} placeholder="201812345M" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <Button type="submit">Save Company Settings</Button>
        </div>
      </form>
    </CardContainer>
  );
}

 