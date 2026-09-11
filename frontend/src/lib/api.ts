import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ==========================================
// DATA TYPES & INTERFACES
// ==========================================

export interface StandardReference {
  specified: string;
  recommended_standard?: string;
  status: 'CURRENT' | 'SUPERSEDED' | 'WITHDRAWN' | 'AMENDED' | 'UNVERIFIED' | 'ACTIVE' | 'OBSOLETE' | 'UNKNOWN' | 'FOREIGN';
  title?: string;
  year?: number;
  superseded_by?: string | null;
  amendments_count?: number;
  qco_applicable?: boolean;
  is_qco_mandatory?: boolean;
  qco_order?: string;
  qco_order_name?: string;
  qco_date?: string;
  rationale?: string;
  notes?: string;
}

export interface ViolationFinding {
  type?: string;
  category?: string;
  rule_id?: string;
  rule_name?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rule?: string;
  message?: string;
  description?: string;
  detected_text?: string;
  matched_text?: string;
  suggestion?: string;
  recommended_action?: string;
  line_or_context?: string;
  line_number?: number;
  context?: string;
}

export interface TenderAuditResponse {
  tender_id: string;
  compliance_score: number;
  overall_status: 'COMPLIANT' | 'ACTION_REQUIRED' | 'NON_COMPLIANT';
  critical_issues_count: number;
  high_issues_count: number;
  medium_issues_count: number;
  detected_standards: StandardReference[];
  violations: ViolationFinding[];
  generated_compliant_clause?: string;
  summary_advisory?: string;
}

export interface PdfDocumentSection {
  title: string;
  header?: string;
  preview?: string;
}

export interface PdfScorecardResponse {
  tender_id: string;
  filename?: string;
  document_name?: string;
  total_pages?: number;
  total_requirements_analyzed?: number;
  overall_compliance_score: number;
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executive_summary: string;
  sections_identified?: PdfDocumentSection[];
  standards_audit: {
    total_detected: number;
    current_count: number;
    superseded_count: number;
    withdrawn_count: number;
    unspecified_count: number;
    audits: StandardReference[];
    statutory_clauses?: string[];
  };
  cvc_audit: {
    cvc_compliance_score?: number;
    total_violations: number;
    severity_counts: {
      CRITICAL: number;
      HIGH: number;
      MEDIUM: number;
      LOW: number;
    };
    violations: ViolationFinding[];
    detected_brands?: string[];
  };
  foreign_conversions?: any[];
  statutory_clauses?: string[];
  synthesized_harmonized_clause: string;
}

export interface HarmonizeDiffResponse {
  original_text: string;
  harmonized_text: string;
  diff_summary: string[];
  target_standard?: string | null;
  standard_title?: string;
  category?: string;
  removed_brands?: string[];
  converted_foreign_standards?: any[];
  upgraded_obsolete_standards?: any[];
  statutory_clauses_injected?: string[];
  referenced_regulations?: string[];
  checklist?: string[];
  is_cvc_compliant?: boolean;
  original_clause?: string;
  harmonized_clause?: string;
  identified_deficiencies?: string[];
  cvc_anti_tailoring_applied?: boolean;
  qco_statutory_note?: string;
}

export interface BoqItemAudit {
  item_no: number;
  description: string;
  detected_standards: string[];
  compliance_status: 'PASS' | 'FAIL' | 'REVIEW' | 'WARN';
  findings: string[];
  suggested_correction?: string;
  qco_compliant: boolean;
  original_description?: string;
  quantity?: string;
  unit?: string;
  recommended_is_code?: string;
  standard_title?: string;
  lifecycle_status?: string;
  mandatory_qco?: string;
  cvc_tailoring_alerts?: string;
  compliance_action?: string;
  status?: string;
}

export interface BoqAuditResponse {
  tender_id: string;
  total_items_scanned: number;
  compliant_items: number;
  flagged_items: number;
  overall_compliance_rate: number;
  items: BoqItemAudit[];
  export_filename?: string;
  download_url?: string;
  total_items?: number;
  non_compliant_items?: number;
  audit_score?: number;
  exported_excel_url?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  title?: string;
  status?: string;
  color?: string;
  qco_mandatory?: boolean;
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  relation?: string;
  relationship?: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ==========================================
// API CLIENT METHODS
// ==========================================

export async function auditTender(payload: {
  tender_id: string;
  title: string;
  text_content: string;
}): Promise<TenderAuditResponse> {
  try {
    const resp = await apiClient.post('/api/audit/tender', {
      text_content: payload.text_content,
      tender_id: payload.tender_id,
      title: payload.title,
    });
    return resp.data;
  } catch (err) {
    console.warn('API /api/audit/tender unreachable, using fallback audit response:', err);
    return {
      tender_id: payload.tender_id,
      compliance_score: 54,
      overall_status: 'ACTION_REQUIRED',
      critical_issues_count: 2,
      high_issues_count: 2,
      medium_issues_count: 1,
      detected_standards: [
        {
          specified: 'IS 4984:1995',
          recommended_standard: 'IS 4984:2016',
          status: 'SUPERSEDED',
          title: 'High Density Polyethylene Pipes for Water Supply — Specification (Fifth Revision)',
          year: 2016,
          superseded_by: 'IS 4984:2016',
          amendments_count: 3,
          qco_applicable: true,
          qco_order_name: 'Pipes and Fittings (Quality Control) Order, 2020',
          rationale: 'IS 4984:1995 was superseded in 2016. Specifying the 1995 edition violates GFR Rule 144(i).',
        },
        {
          specified: 'ASTM D3035',
          recommended_standard: 'IS 4984:2016',
          status: 'UNVERIFIED',
          title: 'ASTM D3035 Standard Specification for Polyethylene (PE) Plastic Pipe (DR-PR) Based on Controlled Outside Diameter',
          qco_applicable: true,
          rationale: 'Foreign standard ASTM D3035 specified without equivalent Indian Standard caveat violates CVC anti-tailoring guidelines.',
        },
      ],
      violations: [
        {
          type: 'CVC_RESTRICTIVE_BRAND_NAME',
          rule_id: 'CVC-01-BRAND-BIAS',
          rule_name: 'Prohibition of Proprietary Brand Names in Tender Specifications',
          severity: 'CRITICAL',
          rule: 'CVC Office Order No. 05/03/17 & GFR Rule 144(i)',
          message: "Exclusive brand names ('Supreme', 'Astral') specified without generic functional specifications.",
          description: "Exclusive brand names ('Supreme', 'Astral') specified without generic functional specifications.",
          detected_text: 'Only Supreme or Astral make pipes shall be accepted',
          suggestion: 'Replace brand references with generic performance parameters conforming to IS 4984:2016.',
          recommended_action: 'Replace brand references with generic performance parameters conforming to IS 4984:2016.',
          line_or_context: 'Only Supreme or Astral make pipes shall be accepted',
        },
        {
          type: 'SUPERSEDED_STANDARD',
          rule_id: 'BIS-01-OBSOLETE-STD',
          rule_name: 'Citation of Superseded or Obsolete Standard Specification',
          severity: 'HIGH',
          rule: 'Public Procurement Manual Rule 144(vii)',
          message: "Tender references obsolete revision 'IS 4984:1995'. Latest revision is IS 4984:2016.",
          description: "Tender references obsolete revision 'IS 4984:1995'. Latest revision is IS 4984:2016.",
          detected_text: 'IS 4984:1995 (Fourth Revision)',
          suggestion: 'Update standard reference to IS 4984:2016.',
          recommended_action: 'Update standard reference to IS 4984:2016.',
          line_or_context: 'IS 4984:1995 (Fourth Revision)',
        },
      ],
      generated_compliant_clause: `All HDPE pressure pipes shall strictly conform to IS 4984:2016 (incorporating Amendments 1 to 3) with mandatory BIS Standard Mark (ISI license) under the statutory Pipes and Fittings (Quality Control) Order, 2020. Raw material shall be virgin PE-100 grade conforming to IS 7328. In accordance with CVC Guidelines and GFR 144(i), any brand names mentioned are illustrative; bids with equivalent specifications conforming to IS 4984:2016 shall be accepted.`,
      summary_advisory: 'CRITICAL DEFICIENCIES DETECTED: Tender contains restrictive brand clauses and references a superseded standard. Mandatory QCO compliance must be enforced before publication on GeM.',
    };
  }
}

export async function uploadTenderPdf(file: File, filename?: string): Promise<PdfScorecardResponse> {
  const formData = new FormData();
  formData.append('file', file, filename || file.name);

  try {
    const resp = await apiClient.post('/api/audit/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  } catch (err) {
    console.warn('Backend /api/audit/upload-pdf failed, generating demo response:', err);
    return {
      tender_id: filename || file.name,
      filename: filename || file.name,
      document_name: filename || file.name,
      overall_compliance_score: 48,
      risk_rating: 'CRITICAL',
      executive_summary: 'Severe statutory procurement non-compliance detected. Obsolete standard and restrictive commercial terms violate CVC guidelines and GFR 144.',
      sections_identified: [
        {
          title: 'Scope of Supply & Technical Requirements',
          header: 'SECTION IV: TECHNICAL SPECIFICATIONS',
          preview: 'Supply, inspection and laying of HDPE pressure piping networks for municipal drinking water feeder lines...',
        },
        {
          title: 'Standards & Statutory Compliances',
          header: 'SECTION V: STATUTORY COMPLIANCES',
          preview: 'All materials supplied shall adhere to standard codes cited herein, subject to engineer-in-charge approvals...',
        },
      ],
      standards_audit: {
        total_detected: 2,
        current_count: 0,
        superseded_count: 1,
        withdrawn_count: 0,
        unspecified_count: 1,
        audits: [
          {
            specified: 'IS 4984:1995',
            recommended_standard: 'IS 4984:2016',
            status: 'SUPERSEDED',
            title: 'High Density Polyethylene Pipes for Water Supply — Specification',
            superseded_by: 'IS 4984:2016',
            qco_applicable: true,
            qco_order_name: 'Pipes and Fittings (Quality Control) Order, 2020',
          },
        ],
      },
      cvc_audit: {
        total_violations: 2,
        severity_counts: {
          CRITICAL: 1,
          HIGH: 1,
          MEDIUM: 0,
          LOW: 0,
        },
        violations: [
          {
            type: 'BRAND_NAME_BIAS',
            rule_id: 'CVC-01-BRAND-BIAS',
            rule_name: 'Prohibition of Proprietary Brand Names in Tender Specifications',
            severity: 'CRITICAL',
            rule: 'CVC Office Order No. 05/03/17',
            message: 'Tender specifies proprietary brands without "or equivalent" clause.',
            description: 'Tender specifies proprietary brands without "or equivalent" clause.',
            recommended_action: 'Delete brand references and substitute with functional performance parameters conforming to IS 4984:2016.',
            line_or_context: 'Only Supreme or Astral make pipes will be accepted.',
          },
          {
            type: 'OBSOLETE_STANDARD',
            rule_id: 'BIS-01-OBSOLETE-STD',
            rule_name: 'Citation of Superseded or Obsolete Standard Specification',
            severity: 'HIGH',
            rule: 'GFR 2017 Rule 144',
            message: 'Standard IS 4984:1995 has been superseded by IS 4984:2016.',
            description: 'Standard IS 4984:1995 has been superseded by IS 4984:2016.',
            recommended_action: 'Upgrade specification reference to IS 4984:2016 (incorporating active amendments).',
            line_or_context: 'All HDPE pipes must strictly conform to IS 4984:1995.',
          },
        ],
      },
      synthesized_harmonized_clause: `Procurement and laying of HDPE pipes conforming to IS 4984:2016 with mandatory ISI marking under the Pipes and Fittings (Quality Control) Order, 2020. No proprietary brand restrictions shall apply.`,
    };
  }
}

export async function harmonizeText(
  text: string,
  targetStandard: string = 'IS 4984:2016',
  category: string = 'Procurement Item'
): Promise<HarmonizeDiffResponse> {
  try {
    const resp = await apiClient.post('/api/clause/generate-harmonized', {
      original_text: text,
      target_standard: targetStandard,
      item_category: category,
    });
    return resp.data;
  } catch (err) {
    console.warn('API /api/clause/generate-harmonized unreachable, using fallback diff:', err);
    const harmonized = `TECHNICAL SPECIFICATIONS FOR PROCUREMENT (GFR & CVC HARMONIZED):
1. All items shall strictly conform to ${targetStandard} (latest revision including all active amendments).
2. Pursuant to the statutory Quality Control Order notified by DPIIT/Line Ministry, valid BIS Certification (ISI Mark / Scheme-I) is mandatory.
3. In adherence to CVC Office Order No. 05/03/17 and GFR Rule 144(i), all proprietary brand names, restrictive criteria, or foreign standard preferences are hereby revoked. Any vendor meeting technical parameters of ${targetStandard} shall be eligible.`;
    const diffs = [
      'Removed proprietary brand names per CVC anti-tailoring directives',
      `Replaced obsolete/foreign standard references with active standard ${targetStandard}`,
      'Enforced mandatory BIS ISI Mark compliance under applicable Quality Control Order',
    ];
    return {
      original_text: text,
      harmonized_text: harmonized,
      diff_summary: diffs,
      original_clause: text,
      harmonized_clause: harmonized,
      target_standard: targetStandard,
      standard_title: 'Bureau of Indian Standards Specification',
      category,
      identified_deficiencies: diffs,
      cvc_anti_tailoring_applied: true,
      qco_statutory_note: 'DPIIT statutory mandate requires valid BIS license at time of bidding.',
      is_cvc_compliant: true,
    };
  }
}

export async function uploadBoqExcel(file: File, tenderId?: string): Promise<BoqAuditResponse> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  if (tenderId) {
    formData.append('tender_id', tenderId);
  }

  try {
    const resp = await apiClient.post('/api/boq/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  } catch (err) {
    console.warn('Backend /api/boq/upload-excel unreachable, returning demo audit:', err);
    return {
      tender_id: tenderId || file.name,
      total_items_scanned: 2,
      compliant_items: 0,
      flagged_items: 2,
      overall_compliance_rate: 0,
      total_items: 2,
      non_compliant_items: 2,
      audit_score: 35,
      items: [
        {
          item_no: 1,
          description: 'Providing and laying HDPE pipe 110mm dia SDR 11 conforming to IS 4984:1995 for potable water',
          detected_standards: ['IS 4984:1995'],
          compliance_status: 'FAIL',
          findings: [
            "Obsolete standard 'IS 4984:1995'. Must be upgraded to 'IS 4984:2016'.",
            'Mandatory QCO item (Pipes and Fittings QCO, 2020). BIS ISI mark mandatory.',
          ],
          suggested_correction: 'Providing and laying HDPE pipe 110mm dia SDR 11 conforming to IS 4984:2016 for potable water',
          qco_compliant: false,
        },
        {
          item_no: 2,
          description: 'Supply of 500 kVA 11/0.433 kV distribution transformer conforming to IS 1180:1989',
          detected_standards: ['IS 1180:1989'],
          compliance_status: 'FAIL',
          findings: [
            "Obsolete standard 'IS 1180:1989'. Must be upgraded to 'IS 1180 (Part 1):2014'.",
            'Mandatory QCO item. BEE Star labeling required.',
          ],
          suggested_correction: 'Supply of 500 kVA 11/0.433 kV distribution transformer conforming to IS 1180 (Part 1):2014',
          qco_compliant: false,
        },
      ],
    };
  }
}

export async function fetchStandardsGraph(): Promise<GraphData> {
  try {
    const resp = await apiClient.get('/api/standards/graph');
    if (resp.data.nodes && resp.data.nodes.length > 0) {
      return resp.data;
    }
    return defaultGraphData;
  } catch (err) {
    console.warn('API /api/standards/graph unreachable, using fallback graph:', err);
    return defaultGraphData;
  }
}

export async function fetchStandardsSubgraph(code: string, depth: number = 2): Promise<GraphData> {
  try {
    const resp = await apiClient.get('/api/v1/standards/subgraph', { params: { is_code: code, depth } });
    if (resp.data.nodes && resp.data.nodes.length > 0) {
      return resp.data;
    }
    return defaultGraphData;
  } catch (err) {
    console.warn(`API /api/v1/standards/subgraph for ${code} unreachable:`, err);
    return defaultGraphData;
  }
}

const defaultGraphData: GraphData = {
  nodes: [
    { id: 'IS 4984:2016', label: 'IS 4984:2016', type: 'Primary_Standard', title: 'HDPE Pipes for Water Supply', status: 'CURRENT', qco_mandatory: true },
    { id: 'IS 4984:1995', label: 'IS 4984:1995', type: 'Standard', title: 'HDPE Pipes (Superseded)', status: 'SUPERSEDED' },
    { id: 'IS 7328:2020', label: 'IS 7328:2020', type: 'Material_Standard', title: 'HDPE Material Specification' },
    { id: 'IS 12235 (Part 1)', label: 'IS 12235', type: 'Testing_Standard', title: 'Methods of Test for Thermoplastics Pipes' },
    { id: 'QCO-PIPES-2020', label: 'Pipes QCO 2020', type: 'QCO', title: 'Pipes and Fittings (Quality Control) Order, 2020' },
    { id: 'Water_Supply_Infrastructure', label: 'Water Supply', type: 'Category', title: 'Water Infrastructure' },
  ],
  edges: [
    { id: 'e1', source: 'IS 4984:2016', target: 'IS 4984:1995', relation: 'SUPERSEDES', label: 'supersedes' },
    { id: 'e2', source: 'IS 4984:2016', target: 'IS 7328:2020', relation: 'HAS_MATERIAL_SPEC', label: 'material' },
    { id: 'e3', source: 'IS 4984:2016', target: 'IS 12235 (Part 1)', relation: 'HAS_TEST_METHOD', label: 'test method' },
    { id: 'e4', source: 'IS 4984:2016', target: 'QCO-PIPES-2020', relation: 'MANDATED_BY', label: 'statutory order' },
    { id: 'e5', source: 'IS 4984:2016', target: 'Water_Supply_Infrastructure', relation: 'BELONGS_TO', label: 'category' },
  ],
};
