import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TAB_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const addCoverPage = (doc, bundle, matter) => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Navy header band
  doc.setFillColor(30, 54, 94);
  doc.rect(0, 0, w, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FORENSIC EVIDENCE BUNDLE', w / 2, 28, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(bundle.name.toUpperCase(), w / 2, 43, { align: 'center' });

  // Matter details
  doc.setTextColor(30, 54, 94);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('MATTER', 20, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(`${matter.name.toUpperCase()} — MATTER ${matter.number}`, 20, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('DATE GENERATED', 20, 96);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  doc.text(now.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }), 20, 104);

  if (bundle.authorisedBy?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('AUTHORISED BY', 20, 120);
    doc.setFont('helvetica', 'normal');
    bundle.authorisedBy.forEach((name, i) => {
      doc.text(name, 20, 128 + i * 9);
    });
  }

  // Footer
  doc.setFillColor(30, 54, 94);
  doc.rect(0, h - 16, w, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('FORENSIC EVIDENCE BUNDLE — CONFIDENTIAL', w / 2, h - 6, { align: 'center' });
};

const addIndexPage = (doc, items, bundle) => {
  doc.addPage();
  const w = doc.internal.pageSize.getWidth();

  doc.setTextColor(30, 54, 94);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('I  N  D  E  X', w / 2, 28, { align: 'center' });

  doc.setDrawColor(30, 54, 94);
  doc.setLineWidth(0.5);
  doc.line(20, 33, w - 20, 33);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(88, 89, 91);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const authorName = bundle.authorisedBy?.[0]?.toUpperCase() || 'DEPONENT';
  doc.text(`AFFIDAVIT OF ${authorName} ON ${dateStr}`, w / 2, 42, { align: 'center' });

  const tableData = items.map((item, i) => [
    TAB_LETTERS[i] || String(i + 1),
    item.name.replace(/\.[^/.]+$/, ''),
    `${i * 2 + 1} – ${i * 2 + 2}`,
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Tab', 'Document Description', 'Pages']],
    body: tableData,
    headStyles: {
      fillColor: [30, 54, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8, textColor: [37, 38, 39] },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [248, 249, 251] },
    margin: { left: 20, right: 20 },
  });

  // Certification block
  if (bundle.settings?.showCertification) {
    const finalY = doc.lastAutoTable?.finalY || 120;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(88, 89, 91);
    doc.text('I certify that this bundle is accurate and complete.', 20, finalY + 14);
    (bundle.authorisedBy || []).forEach((name, i) => {
      const y = finalY + 28 + i * 16;
      doc.setDrawColor(37, 38, 39);
      doc.setLineWidth(0.3);
      doc.line(20, y, 100, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(name, 20, y + 5);
    });
  }
};

const addTabSeparatorPage = (doc, item, tabLetter) => {
  doc.addPage();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(30, 54, 94);
  doc.rect(0, 0, w, h, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(110);
  doc.setFont('helvetica', 'bold');
  doc.text(tabLetter, w / 2, h / 2 - 10, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(item.name.replace(/\.[^/.]+$/, ''), w - 60);
  doc.text(lines, w / 2, h / 2 + 32, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(246, 145, 57);
  doc.text(item.evNumber, w / 2, h / 2 + 50, { align: 'center' });
};

const addImagePage = async (doc, item) => {
  doc.addPage();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = item.previewUrl;
    });
    const maxW = w - 30;
    const maxH = h - 30;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const imgW = img.width * ratio;
    const imgH = img.height * ratio;
    const x = (w - imgW) / 2;
    const y = (h - imgH) / 2;
    const fmt = item.file.type.includes('png') ? 'PNG' : 'JPEG';
    doc.addImage(item.previewUrl, fmt, x, y, imgW, imgH);
  } catch {
    addPlaceholderPage(doc, item);
  }
};

const addPlaceholderPage = (doc, item) => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(221, 225, 231);
  doc.setLineWidth(0.3);
  doc.rect(15, 15, w - 30, h - 30);
  doc.setTextColor(133, 133, 133);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(item.name, w - 60);
  doc.text(lines, w / 2, h / 2 - 8, { align: 'center' });
  doc.setFontSize(9);
  doc.text(item.evNumber, w / 2, h / 2 + 8, { align: 'center' });
  doc.setTextColor(170, 170, 170);
  doc.text('Document content attached separately', w / 2, h / 2 + 20, { align: 'center' });
};

export const generateBundlePDF = async (bundle, allItems, matter) => {
  const items = bundle.itemIds
    .map(id => allItems.find(e => e.id === id))
    .filter(Boolean);

  if (items.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addCoverPage(doc, bundle, matter);

  if (bundle.settings?.showIndex !== false) {
    addIndexPage(doc, items, bundle);
  }

  for (let i = 0; i < items.length; i++) {
    const tab = TAB_LETTERS[i] || String(i + 1);
    addTabSeparatorPage(doc, items[i], tab);
    if (items[i].fileType === 'image' && items[i].previewUrl) {
      await addImagePage(doc, items[i]);
    } else {
      doc.addPage();
      addPlaceholderPage(doc, items[i]);
    }
  }

  const filename = (bundle.name.replace(/[^a-z0-9\s]/gi, '').trim().replace(/\s+/g, '_') || 'bundle') + '.pdf';
  doc.save(filename);
};
