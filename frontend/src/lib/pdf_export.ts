import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AuditCertificateData {
  tenderId: string;
  tenderTitle: string;
  department?: string;
  complianceScore: number;
  overallStatus: 'COMPLIANT' | 'ACTION_REQUIRED' | 'NON_COMPLIANT';
  recommendedStandard?: string;
  standardTitle?: string;
  qcoMandatory?: boolean;
  qcoOrder?: string;
  detectedStandards?: any[];
  synthesizedClause?: string;
  violations?: Array<{
    type?: string;
    rule?: string;
    rule_id?: string;
    rule_name?: string;
    severity?: string;
    description?: string;
    message?: string;
    detected_text?: string;
    matched_text?: string;
    suggestion?: string;
    recommended_action?: string;
    line_or_context?: string;
  }>;
}

export function generateAuditCertificatePDF(data: AuditCertificateData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw Header Border & Institution Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFillColor(16, 185, 129); // emerald-500 top accent
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Government / Project Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MANAKSETU | STANDARDSENSE AUDIT CERTIFICATE', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'National Public Procurement & Indian Standards (BIS / QCO / CVC) Compliance Dossier',
    14,
    22
  );

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Generated: ${timestamp} IST`, pageWidth - 14, 22, { align: 'right' });

  // Body content
  let currentY = 42;

  // Tender Identification Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. PROCUREMENT IDENTIFICATION & SCOPE', 14, currentY);

  currentY += 4;
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    body: [
      ['Tender Reference ID', data.tenderId || 'N/A'],
      ['Procurement Title', data.tenderTitle || 'Public Procurement Specification'],
      ['Procuring Department', data.department || 'Central / State Procurement Directorate'],
      ['Target Applicable Standard', `${data.recommendedStandard || 'N/A'} — ${data.standardTitle || ''}`],
      ['Statutory QCO Status', data.qcoMandatory ? 'MANDATORY (DPIIT / Line Ministry Gazette)' : 'Standard Specification'],
    ],
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Score & Regulatory Status Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. AUDIT FINDINGS & STATUTORY COMPLIANCE RATING', 14, currentY);

  currentY += 4;
  const statusColor: [number, number, number] =
    data.overallStatus === 'COMPLIANT'
      ? [16, 185, 129] // Emerald
      : data.overallStatus === 'ACTION_REQUIRED'
      ? [245, 158, 11] // Amber
      : [239, 68, 68]; // Red

  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    body: [
      [
        {
          content: `Overall Compliance Score: ${data.complianceScore}/100\nStatutory Verdict: ${data.overallStatus}`,
          styles: { fontStyle: 'bold', textColor: statusColor },
        },
      ],
    ],
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // CVC & Regulatory Violations Table (if present)
  if (data.violations && data.violations.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. DETECTED DEFICIENCIES & REGULATORY VIOLATIONS', 14, currentY);

    currentY += 4;
    const violationRows = data.violations.map((v, i) => [
      `${i + 1}`,
      v.severity || 'HIGH',
      v.rule || v.rule_name || 'CVC / GFR Guidelines',
      v.description || v.message || v.detected_text || 'Non-compliance detected',
      v.suggestion || v.recommended_action || 'Harmonize specification to active standard',
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      head: [['#', 'Severity', 'Rule Violated', 'Deficiency Description', 'Recommended Action']],
      body: violationRows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 18, fontStyle: 'bold' },
        2: { cellWidth: 35 },
        3: { cellWidth: 65 },
        4: { cellWidth: 50 },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Synthesized Compliant Clause
  if (data.synthesizedClause) {
    if (currentY + 40 > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. HARMONIZED & STATUTORY-COMPLIANT PROCUREMENT CLAUSE', 14, currentY);

    currentY += 4;
    autoTable(doc, {
      startY: currentY,
      theme: 'plain',
      body: [[data.synthesizedClause]],
      styles: {
        fontSize: 8.5,
        font: 'courier',
        cellPadding: 4,
        fillColor: [248, 250, 252],
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Footer Disclaimer & Stamp
  if (currentY + 25 > pageHeight - 10) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const disclaimer =
    'DISCLAIMER: This document is generated by StandardSense AI Decision Support System to assist public procurement authorities in complying with General Financial Rules (GFR 2017) Rule 144, Central Vigilance Commission (CVC) directives, and statutory Quality Control Orders (QCOs) published by the Government of India. It constitutes a technical verification report and does not substitute statutory Gazette notifications or official BIS certification registries.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28);
  doc.text(splitDisclaimer, 14, currentY);

  const filename = `StandardSense_Audit_Certificate_${(data.tenderId || 'TENDER').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
}
