import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import axios from 'axios';
import CardContainer from '../common/CardContainer';
import api from '../../services/api';

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
    bank_code: '',
    branch_code: '',
    bank_address: '',
    account_name: '',
    account_number: '',
    swift_code: '',
    paynow_uen: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [message, setMessage] = useState('');
 
  useEffect(() => {
    fetch(`${baseUrl}/company-settings/1/`, {
      headers: { Authorization: `Token ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData(data);
          if (data.logo) setLogoPreview(data.logo);
        }
      })
      .catch((err) => console.error('Error fetching settings:', err));
  }, [token, baseUrl]);

  const [settings, setSettings] = useState({
    name: '',
    email: '',
    quotation_format: 'QT-{YYYY}-{SEQ}',
  });
  const [settingId, setSettingId] = useState(null);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:8000/api/company-settings/1/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    if (response.ok) alert('Company settings updated successfully!');
  };
  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  {/* Old Version of HandleSubmit*/}
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const data = new FormData();
  //   Object.keys(formData).forEach((key) => {
  //     if (formData[key] !== null && formData[key] !== undefined) {
  //       data.append(key, formData[key]);
  //     }
  //   });
  //   if (logoFile) {
  //     data.append('logo', logoFile);
  //   }

  //   try {
  //     const response = await fetch(`${baseUrl}/company-settings/1/`, {
  //       method: 'PUT',
  //       headers: { Authorization: `Token ${token}` },
  //       body: data
  //     });
  //     if (response.ok) {
  //       setMessage('Company settings saved successfully!');
  //       setTimeout(() => setMessage(''), 3000);
  //     } else {
  //       setMessage('Failed to save settings.');
  //     }
  //   } catch (error) {
  //     console.error('Error saving settings:', error);
  //     setMessage('An error occurred.');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== 'logo' && formData[key] !== null && formData[key] !== undefined) {
            data.append(key, formData[key]);
        }
    });
    if (logoFile) {
        data.append('logo', logoFile);
    }
    try {
        const response = await axios.put(`${baseUrl}/company-settings/1/`, data, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        setMessage('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        setMessage('Failed to save settings.');
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
          {/* Row 1: Company Name & Tax Registration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name || ''}
                onChange={handleChange}
                style={commonInputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Tax / UEN Registration No.</label>
              <input
                type="text"
                name="tax_registration_no"
                value={formData.tax_registration_no || ''}
                onChange={handleChange}
                style={commonInputStyle}
                placeholder="e.g. 201812345M"
              />
            </div>
          </div>
          {/* Row 2: Company Logo Dropzone Box */}
          <div>
            <label style={labelStyle}>Company Logo</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              minHeight: '90px'
            }}>
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  style={{
                    maxHeight: '80px',
                    maxWidth: '220px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    padding: '6px',
                    backgroundColor: '#ffffff'
                  }}
                />
              ) : (
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  No logo uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{
                  fontSize: '14px',
                  color: '#334155',
                  padding: '8px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  flex: 1
                }}
              />
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
          {/* Row 1: Bank Name & Account Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Bank Name</label>
              <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} style={commonInputStyle} placeholder="e.g. DBS Bank Pte Ltd" />
            </div>
            <div>
              <label style={labelStyle}>Account Name</label>
              <input type="text" name="account_name" value={formData.account_name || ''} onChange={handleChange} style={commonInputStyle} placeholder="e.g. Company Pte Ltd" />
            </div>
            <div>
              <label style={labelStyle}>Bank Code</label>
              <input type="text" name="bank_code" value={formData.bank_code || ''} onChange={handleChange} style={commonInputStyle} placeholder="e.g. 7171"/>
            </div>
            <div>
              <label style={labelStyle}>Branch Code</label>
              <input type="text" name="branch_code" value={formData.branch_code || ''} onChange={handleChange} style={commonInputStyle} placeholder="e.g. 070"/>
            </div>
          </div>

          {/* Row 2: Account Number, SWIFT / BIC, PayNow UEN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Account Number</label>
              <input type="text" name="account_number" value={formData.account_number || ''} onChange={handleChange} style={commonInputStyle} placeholder="070-003801-2" />
            </div>
            <div>
              <label style={labelStyle}>SWIFT / BIC Code</label>
              <input type="text" name="swift_code" value={formData.swift_code || ''} onChange={handleChange} style={commonInputStyle} placeholder="DBSSSGSG" />
            </div>
            <div>
              <label style={labelStyle}>PayNow UEN</label>
              <input type="text" name="paynow_uen" value={formData.paynow_uen || ''} onChange={handleChange} style={commonInputStyle} placeholder="199902857E" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Bank Address</label>
              <textarea name="bank_address" value={formData.bank_address || ''} onChange={handleChange} style={{ ...commonInputStyle, minHeight: '80px', resize: 'vertical'}} placeholder="12 Marina Boulevard, DBS Asia Central, Marina Bay Financial Centre Tower 3, Singapore 018982"/>
          </div>
        </div>          
        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <Button type="submit">Save Company Settings</Button>
        </div>
        {/* Section 4: Quotation Settings */}
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '600' }}>Quotation Configuration</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            {/* 1. Custom Label / Header Name */}
            <div>
              <label style={labelStyle}>Field Label (Header Name)</label>
              <input
                type="text"
                name="quotation_ref_label"
                style={commonInputStyle}
                value={settings.quotation_ref_label || 'Quotation Reference'}
                onChange={(e) => setSettings({ ...settings, quotation_ref_label: e.target.value })}
                placeholder="e.g. Quotation Reference, Estimate No, Doc ID"
              />
            </div>

            {/* 2. Custom Format Pattern */}
            <div>
              <label style={labelStyle}>Reference Format Pattern</label>
              <input
                type="text"
                name="quotation_format"
                style={commonInputStyle}
                value={settings.quotation_format || 'QT-{YYYY}-{SEQ}'}
                onChange={(e) => setSettings({ ...settings, quotation_format: e.target.value })}
                placeholder="e.g. FMQ-{DDMMYY}/{CLIENT_NAME}/{SEQ}"
              />
            </div>
          </div>

          <small style={{ color: '#6c757d' }}>
            Available pattern tags: <code>{'{DDMMYY}'}</code>, <code>{'{YYYY}'}</code>, <code>{'{CLIENT_NAME}'}</code>, <code>{'{SEQ}'}</code>
          </small>
        </div>
      </form>
    </CardContainer>
  );
}

 