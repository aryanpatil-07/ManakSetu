import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    JSON,
    func
)
from app.db.session import Base

class AuditRecord(Base):
    """
    Persists historical tender scrutiny audit submissions from procurement officers.
    Stores the officer's input text, attached image metadata, calculated compliance score,
    detected standards, CVC/QCO violations, and the synthesized compliant technical clause.
    """
    __tablename__ = "audit_records"

    id = Column(String(64), primary_key=True, default=lambda: f"aud_{uuid.uuid4().hex[:12]}")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)
    tender_title = Column(String(255), nullable=False, default="Procurement Tender Item")
    department = Column(String(255), nullable=False, default="Public Works Directorate")
    input_text = Column(Text, nullable=False, default="")
    compliance_score = Column(Integer, nullable=False, default=0)
    overall_status = Column(String(32), nullable=False, default="NON_COMPLIANT")
    critical_issues_count = Column(Integer, nullable=False, default=0)
    high_issues_count = Column(Integer, nullable=False, default=0)
    medium_issues_count = Column(Integer, nullable=False, default=0)
    
    # Structured JSON data
    detected_standards = Column(JSON, nullable=True, default=list)
    violations = Column(JSON, nullable=True, default=list)
    generated_compliant_clause = Column(Text, nullable=True)
    related_clauses = Column(JSON, nullable=True, default=list)
    summary_advisory = Column(Text, nullable=True)
    audit_type = Column(String(32), nullable=False, default="TEXT")

    # Multimodal OCR metadata
    has_image = Column(Boolean, nullable=False, default=False)
    image_filename = Column(String(255), nullable=True)
    image_extracted_text = Column(Text, nullable=True)
    isi_verification = Column(JSON, nullable=True)
    visual_gap_matrix = Column(JSON, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "tender_title": self.tender_title,
            "department": self.department,
            "input_text": self.input_text,
            "compliance_score": self.compliance_score,
            "overall_status": self.overall_status,
            "critical_issues_count": self.critical_issues_count,
            "high_issues_count": self.high_issues_count,
            "medium_issues_count": self.medium_issues_count,
            "detected_standards": self.detected_standards or [],
            "violations": self.violations or [],
            "generated_compliant_clause": self.generated_compliant_clause,
            "related_clauses": self.related_clauses or [],
            "summary_advisory": self.summary_advisory,
            "audit_type": self.audit_type or "TEXT",
            "has_image": self.has_image,
            "image_filename": self.image_filename,
            "image_extracted_text": self.image_extracted_text,
            "isi_verification": self.isi_verification,
            "visual_gap_matrix": self.visual_gap_matrix,
        }


class SpecificationDraft(Base):
    """
    Persists bid-ready specification authoring drafts created in the Specification Builder.
    """
    __tablename__ = "specification_drafts"

    id = Column(String(64), primary_key=True, default=lambda: f"spec_{uuid.uuid4().hex[:12]}")
    audit_id = Column(String(64), nullable=True, index=True)
    tender_title = Column(String(255), nullable=False)
    target_standard = Column(String(64), nullable=False)
    compliance_score = Column(Integer, nullable=False, default=100)
    sections = Column(JSON, nullable=False, default=list)
    compiled_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "audit_id": self.audit_id,
            "tender_title": self.tender_title,
            "target_standard": self.target_standard,
            "compliance_score": self.compliance_score,
            "sections": self.sections,
            "compiled_text": self.compiled_text,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
