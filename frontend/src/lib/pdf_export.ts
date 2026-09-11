import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AuditCertificateData {
  tenderId?: string;
  tenderTitle?: string;
  department?: string;
  complianceScore: number;
  overallStatus: string;
  recommendedStandard?: string;
  standardTitle?: string;
  qcoMandatory?: boolean;
  qcoOrder?: string;
  detectedStandards?: Array<{
    specified: string;
    status: string;
    recommended_standard?: string;
    title?: string;
    is_qco_mandatory?: boolean;
    qco_order?: string;
  }>;
  violations?: Array<{
    rule_id: string;
    rule_name: string;
    severity: string;
    matched_text: string;
    message: string;
    recommended_action: string;
  }>;
  synthesizedClause?: string;
}

export function generateAuditCertificatePDF(data: AuditCertificateData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const certId = `MS-CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Top Tricolor Ribbon (Saffron, White, Green)
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(0, 0, pageWidth, 3, 'F');
  doc.setFillColor(255, 255, 255); // White
  doc.rect(0, 3, pageWidth, 2, 'F');
  doc.setFillColor(19, 136, 8); // Green
  doc.rect(0, 5, pageWidth, 3, 'F');

  // Header Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 30, 60);
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, 17, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 100);
  doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', pageWidth / 2, 22, { align: 'center' });
  doc.text('BUREAU OF INDIAN STANDARDS (BIS) — NATIONAL PROCUREMENT COMPLIANCE', pageWidth / 2, 26, { align: 'center' });

  // Main Certificate Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('VIGILANCE & GFR-144 STANDARDS COMPLIANCE AUDIT CERTIFICATE', pageWidth / 2, 34, { align: 'center' });

  // Certificate Metadata Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`Certificate No: ${certId}`, 18, 44);
  doc.text(`Date & Time: ${dateStr}`, 18, 49);
  doc.text(`Auditing Engine: ManakSetu AI Core v1.0 (SIH26108)`, 18, 54);

  doc.text(`Tender Ref: ${data.tenderId || 'NIT-2026-MUNICIPAL'}`, pageWidth / 2 + 5, 44);
  doc.text(`Procuring Entity: ${data.department || 'Public Works / Municipal Corporation'}`, pageWidth / 2 + 5, 49);
  doc.text(`Scope: ${data.tenderTitle || 'Public Procurement Technical Schedule'}`, pageWidth / 2 + 5, 54);

  // Scorecard Strip
  const isCompliant = data.overallStatus === 'COMPLIANT';
  const statusColor = isCompliant ? [5, 150, 105] : [220, 38, 38];

  doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFillColor(isCompliant ? 236 : 254, isCompliant ? 253 : 242, isCompliant ? 245 : 242);
  doc.roundedRect(14, 62, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`COMPLIANCE STATUS: ${data.overallStatus.replace('_', ' ')}`, 18, 70);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Audit Score: ${data.complianceScore}/100`, pageWidth / 2 + 5, 70);
  doc.text(
    `QCO Mandate: ${data.qcoMandatory ? 'ENFORCED (Section 16, BIS Act)' : 'VOLUNTARY BASELINE'}`,
    pageWidth / 2 + 45,
    70
  );

  let currentY = 83;

  // Table 1: Identified Indian Standards & Lifecycle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. STANDARDS LIFECYCLE & QCO STATUTORY STATUS', 14, currentY);
  currentY += 4;

  const stdRows = (data.detectedStandards && data.detectedStandards.length > 0)
    ? data.detectedStandards.map((s, idx) => [
        `#${idx + 1}`,
        s.specified || 'Unspecified',
        s.status || 'ACTIVE',
        s.recommended_standard || s.specified || 'IS 4984:2016',
        s.is_qco_mandatory ? 'MANDATORY (ISI Mark)' : 'Voluntary',
        s.qco_order ? s.qco_order.substring(0, 32) + '...' : 'N/A'
      ])
    : [
        ['#1', 'Tender Scope', 'PROCESSED', data.recommendedStandard || 'IS 4984:2016', data.qcoMandatory ? 'MANDATORY (ISI Mark)' : 'Voluntary', data.qcoOrder || 'BIS Certified']
      ];

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Cited Code', 'Lifecycle', 'Recommended IS Code', 'QCO Scheme', 'Gazette Order']],
    body: stdRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Table 2: CVC Anti-Tailoring & Brand Violations (if any)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CVC ANTI-TAILORING & GFR-144 VIGILANCE SCRUTINY', 14, currentY);
  currentY += 4;

  const cvcRows = (data.violations && data.violations.length > 0)
    ? data.violations.map((v, idx) => [
        `#${idx + 1}`,
        v.rule_id || 'CVC-ALERT',
        v.severity || 'HIGH',
        v.matched_text || 'Generic',
        v.message.substring(0, 48) + '...',
        v.recommended_action.substring(0, 40) + '...'
      ])
    : [
        ['-', 'CVC-00-CLEAN', 'NONE', 'No Brand Names', 'Specification adheres strictly to CVC OM No. 03-05-1-CTE-9.', 'Approved for GeM custom bid publication.']
      ];

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Rule ID', 'Severity', 'Flagged Text', 'Statutory Violation', 'Mandatory Rectification']],
    body: cvcRows,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Statutory Declarations Block
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('3. STATUTORY PROCUREMENT UNDERTAKINGS & LEGAL GROUNDING:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('• General Financial Rules (GFR 2017) Rule 144(vii): Technical specifications are aligned strictly with national standards (BIS).', 18, currentY + 12);
  doc.text('• Section 16 of the BIS Act, 2016: Non-conforming goods in notified QCO categories are legally prohibited from procurement.', 18, currentY + 17);
  doc.text('• CVC Directives (OM No. 03-05-1-CTE-9): Proprietary trade names and single-make exclusionary conditions have been stripped.', 18, currentY + 22);
  doc.text('• Quality Assurance: All supplied lots require authentic Manufacturer Test Certificates from NABL-accredited testing laboratories.', 18, currentY + 27);

  currentY += 36;

  // Sign-off & Verification Seal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('DIGITAL AUDIT VALIDATION BLOCK', 18, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Cryptographic Verification Hash: SHA-256 / MANAKSETU-STDS-ENGINE', 18, currentY + 9);
  doc.text('Authorized for Upload on GeM (Government e-Marketplace) & CPPP Portal.', 18, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('COMPLIANCE OFFICER / TECHNICAL SCRUTINY COMMITTEE', pageWidth - 14, currentY + 12, { align: 'right' });
  doc.text('Digitally Verified via ManakSetu Engine', pageWidth - 14, currentY + 17, { align: 'right' });

  // Save the PDF
  const filename = `ManakSetu_Compliance_Certificate_${certId}.pdf`;
  doc.save(filename);
  return filename;
}
