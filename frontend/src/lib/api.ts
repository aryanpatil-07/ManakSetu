import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export interface Violation {
  rule_id: string;
  rule_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  matched_text: string;
  message: string;
  recommended_action: string;
  line_or_context?: string;
}

export interface StandardStatus {
  specified: string;
  status: string;
  recommended_standard?: string;
  title?: string;
  is_qco_mandatory: boolean;
  qco_order?: string;
  notes?: string;
}

export interface VisualGapItem {
  feature_name: string;
  image_value: string;
  status_in_text: 'MATCHED' | 'MISSING_FROM_TEXT' | 'DISCREPANCY' | string;
  statutory_requirement: string;
  remediation_action: string;
}

export interface IsiVerificationResult {
  is_isi_present: boolean;
  license_number?: string | null;
  status: 'VERIFIED_LICENSE' | 'UNCERTIFIED_RISK' | 'NO_LICENSE_FOUND' | string;
  verification_message: string;
  statutory_alert?: string | null;
  is_qco_mandatory: boolean;
  applicable_standard?: string | null;
}

export interface RelatedClauseItem {
  clause_type: 'SYNTHESIZED_NIT' | 'STATUTORY_QCO' | 'GFR_144_HARMONIZATION' | 'CVC_ANTI_TAILORING' | string;
  title: string;
  standard_code?: string;
  content: string;
  badge?: string;
  source?: string;
}

export interface TenderAuditResponse {
  tender_id: string;
  audit_id?: string;
  compliance_score: number;
  overall_status: 'COMPLIANT' | 'ACTION_REQUIRED' | 'NON_COMPLIANT';
  critical_issues_count: number;
  high_issues_count: number;
  medium_issues_count: number;
  detected_standards: StandardStatus[];
  violations: Violation[];
  generated_compliant_clause?: string;
  related_clauses?: RelatedClauseItem[];
  summary_advisory: string;
  image_extracted_text?: string | null;
  isi_verification?: IsiVerificationResult | null;
  visual_gap_matrix?: VisualGapItem[] | null;
}

export interface BoqItemAudit {
  item_no: number;
  description: string;
  detected_standards: string[];
  compliance_status: 'PASS' | 'WARN' | 'FAIL';
  findings: string[];
  suggested_correction?: string;
  qco_compliant: boolean;
  recommended_is_code?: string;
  standard_title?: string;
  lifecycle_status?: string;
  mandatory_qco?: string;
  cvc_tailoring_alerts?: string;
  compliance_action?: string;
  original_description?: string;
  status?: string;
}

export interface BoqAuditResponse {
  tender_id: string;
  total_items_scanned: number;
  compliant_items: number;
  flagged_items: number;
  overall_compliance_rate: number;
  export_filename?: string;
  download_url?: string;
  items: BoqItemAudit[];
}

export interface PdfSection {
  title: string;
  header: string;
  preview: string;
}

export interface PdfScorecardResponse {
  document_name: string;
  tender_id?: string;
  total_pages: number;
  sections_identified: PdfSection[];
  total_requirements_analyzed: number;
  overall_compliance_score: number;
  risk_rating: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  standards_audit: {
    audits: StandardStatus[];
    superseded_count: number;
    withdrawn_count: number;
    unspecified_count: number;
    qco_mandatory_count: number;
    statutory_clauses: string[];
  };
  cvc_audit: {
    detected_brands: string[];
    cvc_compliance_score: number;
    severity_counts: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number };
    violations: Violation[];
  };
  foreign_conversions: Array<{
    foreign_standard: string;
    organization: string;
    equivalent_is_code?: string;
    is_title?: string;
    status: string;
    harmonization_note?: string;
  }>;
  statutory_clauses: string[];
  executive_summary: string;
  synthesized_harmonized_clause?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  status?: string;
  title?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface HarmonizeDiffResponse {
  original_text: string;
  harmonized_text: string;
  target_standard: string;
  removed_brands: string[];
  converted_foreign_standards: Array<{
    foreign_standard: string;
    organization: string;
    equivalent_is_code?: string;
    is_title?: string;
    status: string;
    harmonization_note?: string;
  }>;
  upgraded_obsolete_standards: Array<{
    original: string;
    recommended: string;
    reason: string;
  }>;
  statutory_clauses_injected: string[];
  diff_summary: string[];
  referenced_regulations?: string[];
  checklist?: string[];
  is_cvc_compliant: boolean;
}

// API functions
export async function auditTender(data: {
  tender_id?: string;
  title?: string;
  text_content: string;
}): Promise<TenderAuditResponse> {
  const response = await apiClient.post<TenderAuditResponse>('/api/audit/tender', data);
  return response.data;
}

export async function auditMultimodalTender(params: {
  text_content?: string;
  title?: string;
  department?: string;
  tender_id?: string;
  image?: File | Blob | null;
}): Promise<TenderAuditResponse> {
  const formData = new FormData();
  formData.append('text_content', params.text_content || '');
  if (params.title) formData.append('title', params.title);
  if (params.department) formData.append('department', params.department);
  if (params.tender_id) formData.append('tender_id', params.tender_id);
  if (params.image) {
    formData.append('image', params.image, (params.image as File).name || 'product_photo.png');
  }

  const response = await apiClient.post<TenderAuditResponse>('/api/v1/audit/multimodal', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function harmonizeText(
  originalText: string,
  targetStandard?: string,
  itemCategory?: string
): Promise<HarmonizeDiffResponse> {
  const formData = new FormData();
  formData.append('original_text', originalText);
  if (targetStandard) formData.append('target_standard', targetStandard);
  if (itemCategory) formData.append('item_category', itemCategory);

  const response = await apiClient.post<HarmonizeDiffResponse>('/api/v1/harmonize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function uploadTenderPdf(file: File, tenderId = 'PDF-AUDIT'): Promise<PdfScorecardResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tender_id', tenderId);
  const response = await apiClient.post<PdfScorecardResponse>('/api/audit/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function uploadBoqExcel(file: File, tenderId = 'BOQ-AUDIT'): Promise<BoqAuditResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tender_id', tenderId);
  const response = await apiClient.post<BoqAuditResponse>('/api/boq/upload-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function fetchStandardsGraph(): Promise<GraphData> {
  const response = await apiClient.get<GraphData>('/api/standards/graph');
  return response.data;
}

export async function fetchStandardsSubgraph(isCode: string, depth = 1): Promise<GraphData> {
  const response = await apiClient.get<GraphData>('/api/v1/standards/subgraph', {
    params: { is_code: isCode, depth },
  });
  return response.data;
}

export async function generateCompliantClause(params: {
  item_category: string;
  is_standard_code: string;
  include_cvc_safeguards?: boolean;
  include_qco_mandate?: boolean;
}) {
  const response = await apiClient.post('/api/clauses/generate', params);
  return response.data;
}

export interface StandardSearchResult {
  is_code: string;
  standard_number?: string;
  year?: number;
  edition?: string;
  title: string;
  division?: string;
  sectional_committee?: string;
  category?: string;
  status: string;
  supersedes?: string[];
  active_amendments?: string[];
  scope?: string;
  keywords?: string[];
  normative_references?: {
    raw_material?: string[];
    testing_methods?: string[];
    allied_fittings?: string[];
  };
  score?: number;
}

export async function searchStandards(query: string, topK = 10): Promise<StandardSearchResult[]> {
  const response = await apiClient.get<{ query: string; results: StandardSearchResult[] }>(
    '/api/v1/standards/search',
    { params: { query, top_k: topK } }
  );
  return response.data.results || [];
}

export async function fetchAllStandards(): Promise<StandardSearchResult[]> {
  const response = await apiClient.get<StandardSearchResult[]>('/api/v1/standards/all');
  return response.data;
}

export interface QcoRecord {
  order_name: string;
  ministry: string;
  order_number?: string;
  date_of_order?: string;
  date_of_enforcement?: string;
  status: string;
  covered_is_codes: string[];
  applicable_scheme: string;
  statutory_clause?: string;
}

export async function fetchAllQcos(): Promise<QcoRecord[]> {
  const response = await apiClient.get<QcoRecord[]>('/api/v1/qco/all');
  return response.data;
}

// =============================================================================
// HISTORICAL REQUIREMENTS & AUDIT PERSISTENCE (NEON POSTGRESQL)
// =============================================================================

export interface RequirementRecord {
  id: string;
  created_at?: string;
  tender_title: string;
  department: string;
  input_text: string;
  compliance_score: number;
  overall_status: 'COMPLIANT' | 'ACTION_REQUIRED' | 'NON_COMPLIANT' | string;
  critical_issues_count: number;
  high_issues_count: number;
  medium_issues_count: number;
  detected_standards: any[];
  violations: any[];
  generated_compliant_clause?: string;
  related_clauses: RelatedClauseItem[];
  summary_advisory?: string;
  audit_type: 'TEXT' | 'MULTIMODAL' | 'PDF' | 'BOQ' | string;
  has_image: boolean;
  image_filename?: string;
  image_extracted_text?: string;
  isi_verification?: any;
  visual_gap_matrix?: any[];
}

export interface RequirementHistoryResponse {
  total: number;
  records: RequirementRecord[];
}

export interface AuditHistoryStats {
  total_audits: number;
  average_compliance_score: number;
  compliant_count: number;
  action_required_count: number;
  non_compliant_count: number;
  critical_violations_total: number;
  top_standards: Array<{ standard: string; count: number }>;
}

export async function fetchPastRequirements(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  audit_type?: string;
  search?: string;
}): Promise<RequirementHistoryResponse> {
  const response = await apiClient.get<RequirementHistoryResponse>('/api/v1/history/requirements', {
    params,
  });
  return response.data;
}

export async function fetchRequirementById(id: string): Promise<RequirementRecord> {
  const response = await apiClient.get<RequirementRecord>(`/api/v1/history/requirements/${id}`);
  return response.data;
}

export async function deleteRequirement(id: string): Promise<{ status: string; id: string }> {
  const response = await apiClient.delete<{ status: string; id: string }>(`/api/v1/history/requirements/${id}`);
  return response.data;
}

export async function fetchAuditHistoryStats(): Promise<AuditHistoryStats> {
  const response = await apiClient.get<AuditHistoryStats>('/api/v1/history/stats');
  return response.data;
}

export async function seedSampleRequirements(): Promise<{ status: string; message?: string; records_created?: number }> {
  const response = await apiClient.post('/api/v1/history/seed-samples');
  return response.data;
}

// Specification Drafts
export interface SpecificationDraftItem {
  id: string;
  audit_id?: string;
  tender_title: string;
  target_standard: string;
  compliance_score: number;
  sections: any[];
  compiled_text: string;
  created_at?: string;
  updated_at?: string;
}

export async function saveSpecificationDraft(draft: {
  tender_title: string;
  target_standard: string;
  compliance_score?: number;
  sections: any[];
  compiled_text: string;
  audit_id?: string;
}): Promise<SpecificationDraftItem> {
  const response = await apiClient.post<SpecificationDraftItem>('/api/v1/specifications/drafts', draft);
  return response.data;
}

export async function fetchSpecificationDrafts(): Promise<SpecificationDraftItem[]> {
  const response = await apiClient.get<SpecificationDraftItem[]>('/api/v1/specifications/drafts');
  return response.data;
}

export async function deleteSpecificationDraft(id: string): Promise<{ status: string; id: string }> {
  const response = await apiClient.delete<{ status: string; id: string }>(`/api/v1/specifications/drafts/${id}`);
  return response.data;
}

