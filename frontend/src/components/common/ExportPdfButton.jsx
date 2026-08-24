import html2pdf from 'html2pdf.js';
import Button from './Button';

export default function ExportPdfButton({ elementId, fileName = 'document.pdf' }) {
  const handleExport = () => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      console.error(`Element with id #${elementId} not found.`);
      return;
    }

    const options = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(options).from(targetElement).save();
  };

  return (
    <Button onClick={handleExport} variant="secondary">
      📄 Export PDF
    </Button>
  );
}