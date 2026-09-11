from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DetectedViolation(BaseModel):
    rule_id: str
    rule_name: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    matched_text: str
    message: str
    recommended_action: str
    line_or_context: Optional[str] = None

class StandardStatus(BaseModel):
    specified: str
    status: str  # ACTIVE, OBSOLETE, UNKNOWN, FOREIGN
    recommended_standard: Optional[str] = None
    title: Optional[str] = None
    is_qco_mandatory: bool = False
    qco_order: Optional[str] = None
    notes: Optional[str] = None

class VisualGapItem(BaseModel):
    feature_name: str
    image_value: str
    status_in_text: str  # MATCHED, MISSING_FROM_TEXT, DISCREPANCY
    statutory_requirement: str
    remediation_action: str

class IsiVerificationResult(BaseModel):
    is_isi_present: bool
    license_number: Optional[str] = None
    status: str  # VERIFIED_LICENSE, UNCERTIFIED_RISK, NO_LICENSE_FOUND
    verification_message: str
    statutory_alert: Optional[str] = None
    is_qco_mandatory: bool = False
    applicable_standard: Optional[str] = None

class TenderAuditResponse(BaseModel):
    tender_id: str
    audit_id: Optional[str] = None
    compliance_score: int  # 0 - 100
    overall_status: str  # COMPLIANT, ACTION_REQUIRED, NON_COMPLIANT
    critical_issues_count: int
    high_issues_count: int
    medium_issues_count: int
    detected_standards: List[StandardStatus]
    violations: List[DetectedViolation]
    generated_compliant_clause: Optional[str] = None
    related_clauses: Optional[List[Dict[str, Any]]] = None
    summary_advisory: str
    image_extracted_text: Optional[str] = None
    isi_verification: Optional[IsiVerificationResult] = None
    visual_gap_matrix: Optional[List[VisualGapItem]] = None

class BoqItemAuditResult(BaseModel):
    item_no: Any
    original_description: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    recommended_is_code: Optional[str] = None
    standard_title: Optional[str] = None
    lifecycle_status: Optional[str] = None
    mandatory_qco: Optional[str] = None
    cvc_tailoring_alerts: Optional[str] = None
    compliance_action: Optional[str] = None
    status: Optional[str] = "PASS"

class BoqAuditResponse(BaseModel):
    tender_id: str
    total_items_scanned: int
    compliant_items: int
    flagged_items: int
    overall_compliance_rate: float
    export_filename: Optional[str] = None
    download_url: Optional[str] = None
    items: List[Dict[str, Any]]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # standard, qco, foreign, category
    status: Optional[str] = None
    title: Optional[str] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    label: str  # supersedes, equivalent_to, mandates, references

class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ClauseSynthesisResponse(BaseModel):
    standard_code: str
    item_category: str
    clause_title: str
    synthesized_clause_text: str
    referenced_regulations: List[str]
    checklist: List[str]

class RequirementRecordSchema(BaseModel):
    id: str
    created_at: Optional[str] = None
    tender_title: str
    department: str
    input_text: str
    compliance_score: int
    overall_status: str
    critical_issues_count: int
    high_issues_count: int
    medium_issues_count: int
    detected_standards: List[Dict[str, Any]] = []
    violations: List[Dict[str, Any]] = []
    generated_compliant_clause: Optional[str] = None
    related_clauses: List[Dict[str, Any]] = []
    summary_advisory: Optional[str] = None
    audit_type: str = "TEXT"
    has_image: bool = False
    image_filename: Optional[str] = None
    image_extracted_text: Optional[str] = None
    isi_verification: Optional[Dict[str, Any]] = None
    visual_gap_matrix: Optional[List[Dict[str, Any]]] = None

class RequirementHistoryResponse(BaseModel):
    total: int
    records: List[RequirementRecordSchema]

class AuditStatsResponse(BaseModel):
    total_audits: int
    average_compliance_score: float
    compliant_count: int
    action_required_count: int
    non_compliant_count: int
    critical_violations_total: int
    top_standards: List[Dict[str, Any]]

class SpecificationDraftCreate(BaseModel):
    tender_title: str
    target_standard: str
    compliance_score: int = 100
    sections: List[Dict[str, Any]] = []
    compiled_text: str
    audit_id: Optional[str] = None

class SpecificationDraftResponse(BaseModel):
    id: str
    audit_id: Optional[str] = None
    tender_title: str
    target_standard: str
    compliance_score: int
    sections: List[Dict[str, Any]]
    compiled_text: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
