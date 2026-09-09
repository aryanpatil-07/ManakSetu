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

class TenderAuditResponse(BaseModel):
    tender_id: str
    compliance_score: int  # 0 - 100
    overall_status: str  # COMPLIANT, ACTION_REQUIRED, NON_COMPLIANT
    critical_issues_count: int
    high_issues_count: int
    medium_issues_count: int
    detected_standards: List[StandardStatus]
    violations: List[DetectedViolation]
    generated_compliant_clause: Optional[str] = None
    summary_advisory: str

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
