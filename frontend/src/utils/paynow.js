// Helper for EMVCo Tag-Length-Value (TLV) format
function formatTLV(tag, value) {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

// CRC16-CCITT checksum (Polynomial 0x1021, Init 0xFFFF)
function calcCRC16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePayNowPayload({ uen, amount, refNumber, companyName = "MY COMPANY PTE LTD" }) {
  if (!uen) return '';

  const cleanUEN = uen.trim().toUpperCase();
  const formattedAmount = Number(amount || 0).toFixed(2);
  const cleanRef = (refNumber || '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 25); // Max 25 chars

  // Tag 26: PayNow Merchant Account Information
  const tag26SubFields = 
    formatTLV('00', 'SG.PAYNOW') +
    formatTLV('01', '1') +         // 1 = UEN (0 = Mobile, 2 = VPA)
    formatTLV('02', cleanUEN) +
    formatTLV('03', '0');          // 0 = Amount is locked/non-editable

  // Tag 62: Additional Data (Bill Reference Number)
  const tag62SubFields = formatTLV('01', cleanRef);

  // Assemble EMVCo standard string
  let payload = '';
  payload += formatTLV('00', '01');                            // Payload Format Indicator
  payload += formatTLV('01', '12');                            // 12 = Dynamic QR (specific amount)
  payload += formatTLV('26', tag26SubFields);
  payload += formatTLV('52', '0000');                          // Merchant Category Code
  payload += formatTLV('53', '702');                           // Currency: SGD
  payload += formatTLV('54', formattedAmount);                 // Transaction Amount
  payload += formatTLV('58', 'SG');                            // Country Code
  payload += formatTLV('59', companyName.substring(0, 25));    // Merchant Name
  payload += formatTLV('60', 'Singapore');                     // Merchant City
  payload += formatTLV('62', tag62SubFields);

  // Tag 63: Checksum
  payload += '6304';
  const crc = calcCRC16(payload);

  return payload + crc;
}