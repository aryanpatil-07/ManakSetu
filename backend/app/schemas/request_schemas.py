from typing import Optional, List
from pydantic import BaseModel, Field

class TenderAuditRequest(BaseModel):
    tender_id: Optional[str] = Field(default="TND-2026-001", description="Identifier for the tender")
    title: Optional[str] = Field(default="Municipal Procurement Tender", description="Tender title")
    text_content: Optional[str] = Field(default=None, description="Raw text of tender specifications or RFP document")
    text: Optional[str] = Field(default=None, description="Alias for text_content")
    department: Optional[str] = Field(default="Public Works Department", description="Procuring entity/department")
    detect_cvc_violations: bool = Field(default=True, description="Flag brand names and anti-tailoring rules")
    check_qco_compliance: bool = Field(default=True, description="Verify mandatory BIS QCO compliance")

    def get_text(self) -> str:
        return (self.text_content or self.text or "").strip()

class StandardSearchRequest(BaseModel):
    query: str = Field(..., description="Query string e.g. 'IS 4984', 'HDPE pipes', 'transformers'")
    top_k: int = Field(default=5, description="Number of results to return")

class BoqItem(BaseModel):
    item_no: int
    description: str
    quantity: Optional[float] = 1.0
    unit: Optional[str] = "Nos"
    estimated_rate: Optional[float] = None
    specified_standard: Optional[str] = None

class BoqAuditRequest(BaseModel):
    tender_id: Optional[str] = "BOQ-001"
    items: List[BoqItem]

class ClauseSynthesisRequest(BaseModel):
    item_category: str = Field(..., description="e.g. 'HDPE Pipes', 'Distribution Transformers', 'Reinforcement Steel'")
    is_standard_code: str = Field(..., description="e.g. 'IS 4984:2016'")
    include_cvc_safeguards: bool = True
    include_qco_mandate: bool = True
    custom_parameters: Optional[dict] = Field(default_factory=dict)

class HarmonizeRequest(BaseModel):
    original_text: Optional[str] = None
    text: Optional[str] = None
    target_standard: Optional[str] = None
    item_category: Optional[str] = None
    category: Optional[str] = None

class StandardDetailRequest(BaseModel):
    code: str = Field(..., description="IS Standard code, e.g. 'IS 4984:2016'")
    depth: int = Field(default=1, description="Graph traversal depth")
