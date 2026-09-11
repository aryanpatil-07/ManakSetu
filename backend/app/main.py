from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional, Dict, Any, List

from app.core.config import settings
from app.core.security import setup_cors, check_rate_limit
from app.schemas.request_schemas import (
    TenderAuditRequest,
    StandardSearchRequest,
    BoqAuditRequest,
    ClauseSynthesisRequest
)
from app.schemas.response_schemas import (
    TenderAuditResponse,
    BoqAuditResponse,
    KnowledgeGraphResponse,
    ClauseSynthesisResponse,
    RequirementRecordSchema,
    RequirementHistoryResponse,
    AuditStatsResponse,
    SpecificationDraftCreate,
    SpecificationDraftResponse
)
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from app.db.session import SessionLocal, get_db, init_db
from app.db.models import AuditRecord, SpecificationDraft
from app.services.hybrid_retriever import HybridRetriever
from app.services.knowledge_graph import StandardsKnowledgeGraph
from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter
from app.services.foreign_converter import ForeignConverter
from app.services.document_parser import DocumentParser
from app.services.boq_processor import BoQProcessor
from app.services.clause_generator import ClauseGenerator
from app.services.multimodal_auditor import MultimodalAuditor

# Global singletons
retriever: Optional[HybridRetriever] = None
kg: Optional[StandardsKnowledgeGraph] = None
regulatory_engine: Optional[RegulatoryEngine] = None
cvc_linter: Optional[CVCLinter] = None
foreign_converter: Optional[ForeignConverter] = None
doc_parser: Optional[DocumentParser] = None
boq_processor: Optional[BoQProcessor] = None
clause_gen: Optional[ClauseGenerator] = None
multimodal_auditor: Optional[MultimodalAuditor] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables & migrations in Neon PostgreSQL
    init_db()

    # Initialize engine services on startup
    global retriever, kg, regulatory_engine, cvc_linter, foreign_converter, doc_parser, boq_processor, clause_gen, multimodal_auditor
    retriever = HybridRetriever()
    kg = StandardsKnowledgeGraph()
    regulatory_engine = RegulatoryEngine(kg=kg)
    foreign_converter = ForeignConverter()
    cvc_linter = CVCLinter(foreign_converter=foreign_converter)
    clause_gen = ClauseGenerator(
        regulatory_engine=regulatory_engine,
        cvc_linter=cvc_linter,
        foreign_converter=foreign_converter
    )
    doc_parser = DocumentParser(
        regulatory_engine=regulatory_engine,
        cvc_linter=cvc_linter,
        foreign_converter=foreign_converter,
        clause_generator=clause_gen,
        retriever=retriever
    )
    boq_processor = BoQProcessor(
        regulatory_engine=regulatory_engine,
        cvc_linter=cvc_linter,
        foreign_converter=foreign_converter,
        retriever=retriever
    )
    multimodal_auditor = MultimodalAuditor(
        regulatory_engine=regulatory_engine,
        cvc_linter=cvc_linter,
        foreign_converter=foreign_converter,
        clause_generator=clause_gen,
        retriever=retriever
    )
    print("ManakSetu Engine initialized successfully.")
    yield
    print("ManakSetu Engine shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="ManakSetu: Intelligent Standards Harmonization & Procurement Compliance Engine for Indian Public Procurement",
    lifespan=lifespan
)

# Setup CORS
setup_cors(app)

# Mount Static Files for BoQ and PDF report downloads
static_dir = Path(__file__).resolve().parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)
(static_dir / "exports").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "description": "BIS Regulatory Compliance, QCO Enforcement, GFR 144(vii) & CVC Anti-Tailoring Engine"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

def build_related_clauses(
    target_std: Optional[str],
    detected_statuses: list,
    violations: list,
    sample_clause: Optional[str],
    title: Optional[str] = None
) -> list:
    """
    Constructs structured related clauses for persistence:
    1. Harmonized Notice Inviting Tender (NIT) compliant technical clause
    2. Mandatory Quality Control Order (QCO) statutory compliance clause
    3. GFR Rule 144(vii) foreign standard harmonization clause
    4. Central Vigilance Commission (CVC) brand neutrality safeguard clause
    """
    clauses = []

    # 1. Synthesized Compliant NIT Clause
    if sample_clause:
        clauses.append({
            "clause_type": "SYNTHESIZED_NIT",
            "title": f"Harmonized Notice Inviting Tender (NIT) Clause ({target_std or 'BIS Compliant'})",
            "standard_code": target_std or "BIS Standard",
            "content": sample_clause,
            "badge": "Audit-Proof NIT Specification",
            "source": "ManakSetu Regulatory Clause Generator"
        })

    # 2. Statutory QCO Order Mandates
    for st in (detected_statuses or []):
        st_dict = st if isinstance(st, dict) else (st.model_dump() if hasattr(st, "model_dump") else getattr(st, "__dict__", {}))
        if st_dict.get("is_qco_mandatory"):
            qco_name = st_dict.get("qco_order") or "Quality Control Order (Section 16, BIS Act 2016)"
            is_code = st_dict.get("recommended_standard") or st_dict.get("specified") or target_std
            title_std = st_dict.get("title") or "Indian Standard Specification"
            clauses.append({
                "clause_type": "STATUTORY_QCO",
                "title": f"Statutory QCO Enforcement Clause — {is_code}",
                "standard_code": is_code,
                "content": (
                    f"STATUTORY QUALITY CONTROL ORDER COMPLIANCE MANDATE:\n"
                    f"As per the gazetted {qco_name} issued under Section 16 of the Bureau of Indian Standards Act, 2016, "
                    f"all items supplied under this contract for '{title or title_std}' shall mandatorily conform to {is_code} "
                    f"and bear the standard BIS ISI Certification Mark with a valid CM/L license number. "
                    f"Consignments lacking a verified BIS Standard Mark shall be summarily rejected at inspection stage."
                ),
                "badge": "Statutory Law (QCO)",
                "source": "Ministry Gazette Notification & BIS Act 2016"
            })

    # 3. Foreign Standard Conversion (GFR 144(vii))
    for st in (detected_statuses or []):
        st_dict = st if isinstance(st, dict) else (st.model_dump() if hasattr(st, "model_dump") else getattr(st, "__dict__", {}))
        spec = str(st_dict.get("specified", "")).upper()
        if any(prefix in spec for prefix in ["ASTM", "ISO", "EN", "DIN", "BS", "JIS"]):
            rec = st_dict.get("recommended_standard")
            if rec:
                clauses.append({
                    "clause_type": "GFR_144_HARMONIZATION",
                    "title": f"GFR Rule 144(vii) Harmonization Clause ({st_dict.get('specified')} → {rec})",
                    "standard_code": rec,
                    "content": (
                        f"GENERAL FINANCIAL RULES (GFR) 2017 - RULE 144(vii) CONVERSION:\n"
                        f"Technical specification referencing foreign standard '{st_dict.get('specified')}' is harmonized to "
                        f"domestic national standard {rec}. In compliance with Ministry of Finance Public Procurement Directives, "
                        f"conformance to {rec} is mandatory and shall supersede any foreign standard citations."
                    ),
                    "badge": "GFR Rule 144(vii)",
                    "source": "Ministry of Finance Procurement Policy Division"
                })

    # 4. CVC Anti-Tailoring & Brand Neutrality Clause
    brand_violations = [
        v for v in (violations or [])
        if "BRAND" in str(getattr(v, "rule_id", "") if hasattr(v, "rule_id") else (v.get("rule_id", "") if isinstance(v, dict) else ""))
    ]
    if brand_violations:
        clauses.append({
            "clause_type": "CVC_ANTI_TAILORING",
            "title": "CVC Circular 02/02/2023 Brand Neutrality Clause",
            "standard_code": "CVC Anti-Tailoring",
            "content": (
                f"CENTRAL VIGILANCE COMMISSION (CVC) BRAND-NEUTRALITY SAFEGUARD:\n"
                f"In accordance with CVC Office Memorandum No. 02/02/2023 on anti-restrictive tender conditions, "
                f"all restrictive brand names and sole-distributor covenants have been excised. Bidders may offer any make or model "
                f"that fully meets the functional performance parameters and holds accredited BIS certification."
            ),
            "badge": "CVC Anti-Tailoring Directive",
            "source": "Central Vigilance Commission (Govt. of India)"
        })

    return clauses

# =============================================================================
# 1. TEXT AUDIT & SPECIFICATION HARMONIZER (PHASE 2, 3, 4)
# =============================================================================

@app.post("/api/v1/audit/text", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
@app.post("/api/audit/tender", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
def audit_tender_text(payload: TenderAuditRequest):
    """
    Audits a single procurement specification string:
    - Extracts cited Indian Standards, evaluates lifecycle (CURRENT vs SUPERSEDED vs WITHDRAWN)
    - Checks gazetted QCO orders under Section 16 of the BIS Act, 2016
    - Scans for proprietary brand names and CVC anti-tailoring violations
    - Converts foreign standards under GFR 144(vii)
    - Synthesizes an audit-proof Notice Inviting Tender (NIT) clause
    - Persistently stores the requirement, compliance score, and related clauses in Neon PostgreSQL
    """
    standards_audit = regulatory_engine.audit_text_standards(payload.text_content)
    detected_statuses = standards_audit["audits"]
    cvc_audit = cvc_linter.audit_text(payload.text_content)
    violations = cvc_audit["violations"]

    critical_count = cvc_audit["severity_counts"]["CRITICAL"] + standards_audit["withdrawn_count"]
    high_count = cvc_audit["severity_counts"]["HIGH"] + standards_audit["superseded_count"]
    medium_count = cvc_audit["severity_counts"]["MEDIUM"] + standards_audit["unspecified_count"]

    # Calculate compliance score (0-100)
    score = 100 - (critical_count * 25) - (high_count * 15) - (medium_count * 5)
    score = max(0, min(100, score))

    if score >= 85 and critical_count == 0:
        overall_status = "COMPLIANT"
    elif score >= 50:
        overall_status = "ACTION_REQUIRED"
    else:
        overall_status = "NON_COMPLIANT"

    # Synthesize compliant clause if standards were identified
    sample_clause = None
    target_std = None
    if detected_statuses:
        target_std = detected_statuses[0].get("recommended_standard") or detected_statuses[0].get("specified")
    else:
        # Infer standard using hybrid retriever
        search_res = retriever.search(payload.text_content, top_k=1)
        if search_res:
            target_std = search_res[0]["is_code"]

    if target_std:
        res = clause_gen.generate_clause(
            item_category=payload.title or "Procurement Item",
            standard_code=target_std
        )
        sample_clause = res["synthesized_clause_text"]

    summary = (
        f"Audited tender: {critical_count} critical defects, {high_count} high-risk violations. "
        f"Overall compliance evaluated at {score}%. "
        + ("Immediate rectification required before tender publication." if score < 70 else "Minor revisions suggested.")
    )

    # Build comprehensive related clauses
    related_clauses = build_related_clauses(
        target_std=target_std,
        detected_statuses=detected_statuses,
        violations=violations,
        sample_clause=sample_clause,
        title=payload.title
    )

    # Persist in Neon DB
    audit_id = None
    try:
        with SessionLocal() as db:
            record = AuditRecord(
                tender_title=payload.title or "Procurement Tender Item",
                department="Public Works Directorate",
                input_text=payload.text_content,
                compliance_score=int(score),
                overall_status=overall_status,
                critical_issues_count=critical_count,
                high_issues_count=high_count,
                medium_issues_count=medium_count,
                detected_standards=[st if isinstance(st, dict) else st.model_dump() for st in detected_statuses],
                violations=[v if isinstance(v, dict) else (v.model_dump() if hasattr(v, "model_dump") else getattr(v, "__dict__", {})) for v in violations],
                generated_compliant_clause=sample_clause,
                related_clauses=related_clauses,
                summary_advisory=summary,
                audit_type="TEXT"
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            audit_id = record.id
    except Exception as db_err:
        print(f"[DATABASE LOG] Failed to persist audit to Neon PostgreSQL: {db_err}")

    return TenderAuditResponse(
        tender_id=payload.tender_id or "TND-AUDIT",
        audit_id=audit_id,
        compliance_score=int(score),
        overall_status=overall_status,
        critical_issues_count=critical_count,
        high_issues_count=high_count,
        medium_issues_count=medium_count,
        detected_standards=detected_statuses,
        violations=violations,
        generated_compliant_clause=sample_clause,
        related_clauses=related_clauses,
        summary_advisory=summary
    )

@app.post("/api/v1/audit/multimodal", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
async def audit_multimodal_tender(
    text_content: str = Form(""),
    title: Optional[str] = Form("Procurement Item"),
    department: Optional[str] = Form("Public Works Directorate"),
    tender_id: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Multi-modal Specification & Image Compliance Auditor:
    - Extracts text, ratings, dimensions, brands, and codes from uploaded image (nameplate/photo/label)
    - Verifies presence of BIS Standard Mark (ISI logo) and CM/L license number
    - Generates the Visual Gap Matrix comparing image attributes against buyer's draft text
    - Identifies missing testing/statutory clauses and synthesizes an audit-proof tender clause
    - Persistently stores multimodal scrutiny in Neon PostgreSQL
    """
    image_bytes = None
    filename = None
    if image is not None:
        image_bytes = await image.read()
        filename = image.filename or "uploaded_image.png"

    response = await multimodal_auditor.audit_multimodal(
        text_content=text_content,
        image_bytes=image_bytes,
        filename=filename,
        tender_id=tender_id or "MM-AUDIT",
        title=title,
        department=department
    )

    # Build comprehensive related clauses
    primary_std = None
    if response.detected_standards:
        primary_std = response.detected_standards[0].recommended_standard or response.detected_standards[0].specified
    
    related_clauses = build_related_clauses(
        target_std=primary_std,
        detected_statuses=response.detected_standards,
        violations=response.violations,
        sample_clause=response.generated_compliant_clause,
        title=title
    )
    response.related_clauses = related_clauses

    # Persist in Neon DB
    try:
        with SessionLocal() as db:
            record = AuditRecord(
                tender_title=title or "Multimodal Tender Scrutiny",
                department=department or "Public Works Directorate",
                input_text=text_content,
                compliance_score=response.compliance_score,
                overall_status=response.overall_status,
                critical_issues_count=response.critical_issues_count,
                high_issues_count=response.high_issues_count,
                medium_issues_count=response.medium_issues_count,
                detected_standards=[st.model_dump() if hasattr(st, "model_dump") else st for st in response.detected_standards],
                violations=[v.model_dump() if hasattr(v, "model_dump") else v for v in response.violations],
                generated_compliant_clause=response.generated_compliant_clause,
                related_clauses=related_clauses,
                summary_advisory=response.summary_advisory,
                audit_type="MULTIMODAL" if image_bytes else "TEXT",
                has_image=bool(image_bytes),
                image_filename=filename,
                image_extracted_text=response.image_extracted_text,
                isi_verification=response.isi_verification.model_dump() if response.isi_verification else None,
                visual_gap_matrix=[g.model_dump() if hasattr(g, "model_dump") else g for g in (response.visual_gap_matrix or [])]
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            response.audit_id = record.id
    except Exception as db_err:
        print(f"[DATABASE LOG] Failed to persist multimodal audit to Neon: {db_err}")

    return response

@app.post("/api/v1/harmonize", dependencies=[Depends(check_rate_limit)])
def harmonize_text(original_text: str = Form(...), target_standard: Optional[str] = Form(None), item_category: Optional[str] = Form(None)):
    """
    Generates side-by-side comparison payload (Original vs Harmonized).
    """
    return clause_gen.generate_harmonized_diff(
        original_text=original_text,
        target_standard=target_standard,
        item_category=item_category
    )

# =============================================================================
# 2. PDF RFP SCRUTINIZER (PHASE 5)
# =============================================================================

@app.post("/api/v1/audit/rfp", dependencies=[Depends(check_rate_limit)])
@app.post("/api/audit/upload-pdf", dependencies=[Depends(check_rate_limit)])
async def audit_pdf_upload(file: UploadFile = File(...), tender_id: Optional[str] = Form("PDF-TENDER")):
    """
    Multi-modal PDF RFP Scrutinizer:
    - Slices Technical Specifications, Schedule of Requirements, and Scope of Supply
    - Audits every clause against BIS standards, QCO orders, and CVC rules
    - Produces a consolidated executive Audit Scorecard
    - Persists summary scrutiny in Neon PostgreSQL
    """
    contents = await file.read()
    filename = file.filename or "uploaded_tender.pdf"
    scorecard = doc_parser.scrutinize_pdf(contents, filename=filename)
    scorecard["tender_id"] = tender_id

    # Persist in Neon DB
    try:
        with SessionLocal() as db:
            std_list = [st if isinstance(st, dict) else st.model_dump() for st in scorecard.get("standards_audit", {}).get("audits", [])]
            viol_list = [v if isinstance(v, dict) else v.model_dump() for v in scorecard.get("cvc_audit", {}).get("violations", [])]
            sample_clause = scorecard.get("synthesized_harmonized_clause")
            crit_count = scorecard.get("cvc_audit", {}).get("severity_counts", {}).get("CRITICAL", 0)
            high_count = scorecard.get("cvc_audit", {}).get("severity_counts", {}).get("HIGH", 0)
            med_count = scorecard.get("cvc_audit", {}).get("severity_counts", {}).get("MEDIUM", 0)
            score = scorecard.get("overall_compliance_score", 0)
            status_str = "COMPLIANT" if score >= 85 and crit_count == 0 else ("ACTION_REQUIRED" if score >= 50 else "NON_COMPLIANT")

            related = build_related_clauses(
                target_std=std_list[0].get("recommended_standard") if std_list else None,
                detected_statuses=std_list,
                violations=viol_list,
                sample_clause=sample_clause,
                title=filename
            )

            rec = AuditRecord(
                tender_title=f"RFP Scrutiny: {filename}",
                department="Procurement Review Board",
                input_text=f"Uploaded PDF Document: {filename} ({scorecard.get('total_pages', 1)} pages, {scorecard.get('total_requirements_analyzed', 0)} requirements analyzed)",
                compliance_score=int(score),
                overall_status=status_str,
                critical_issues_count=crit_count,
                high_issues_count=high_count,
                medium_issues_count=med_count,
                detected_standards=std_list,
                violations=viol_list,
                generated_compliant_clause=sample_clause,
                related_clauses=related,
                summary_advisory=scorecard.get("executive_summary", ""),
                audit_type="PDF",
                image_filename=filename
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)
            scorecard["audit_id"] = rec.id
    except Exception as db_err:
        print(f"[DATABASE LOG] Failed to persist PDF scrutiny to Neon: {db_err}")

    return scorecard

# =============================================================================
# 3. EXCEL BOQ BATCH AUDITOR (PHASE 5)
# =============================================================================

@app.post("/api/v1/audit/boq", response_model=BoqAuditResponse, dependencies=[Depends(check_rate_limit)])
@app.post("/api/boq/upload-excel", response_model=BoqAuditResponse, dependencies=[Depends(check_rate_limit)])
async def audit_boq_excel(file: UploadFile = File(...), tender_id: Optional[str] = Form("EXCEL-BOQ")):
    """
    Multi-Item Excel BoQ Batch Auditor:
    - Automatically detects item description, quantity, and unit columns
    - Validates each row against BIS catalog, QCO orders, and CVC anti-tailoring rules
    - Appends 6 standardized audit columns and provides an instant export download link
    - Persists batch scrutiny in Neon PostgreSQL
    """
    contents = await file.read()
    filename = file.filename or "uploaded_boq.xlsx"
    result = boq_processor.process_excel_bytes(contents, filename_prefix="audited_boq")

    # Persist in Neon DB
    try:
        with SessionLocal() as db:
            rate = result["overall_compliance_rate"]
            status_str = "COMPLIANT" if rate >= 85 else ("ACTION_REQUIRED" if rate >= 50 else "NON_COMPLIANT")
            rec = AuditRecord(
                tender_title=f"BoQ Audit: {filename}",
                department="Works & Supplies Directorate",
                input_text=f"Batch Excel BoQ: {filename} ({result['total_items_scanned']} items scanned, {result['compliant_items']} compliant, {result['flagged_items']} flagged)",
                compliance_score=int(rate),
                overall_status=status_str,
                critical_issues_count=result["flagged_items"],
                high_issues_count=0,
                medium_issues_count=0,
                detected_standards=[{"specified": item.get("recommended_is_code", ""), "title": item.get("standard_title", "")} for item in result["items"] if item.get("recommended_is_code")],
                violations=[{"rule_id": "BOQ-TAILORING", "message": item.get("cvc_tailoring_alerts", "")} for item in result["items"] if item.get("cvc_tailoring_alerts")],
                summary_advisory=f"Batch BoQ Scrutiny for {result['total_items_scanned']} items. Overall compliance rate: {rate}%.",
                audit_type="BOQ",
                image_filename=filename
            )
            db.add(rec)
            db.commit()
    except Exception as db_err:
        print(f"[DATABASE LOG] Failed to persist BoQ scrutiny to Neon: {db_err}")

    return BoqAuditResponse(
        tender_id=tender_id or "EXCEL-BOQ",
        total_items_scanned=result["total_items_scanned"],
        compliant_items=result["compliant_items"],
        flagged_items=result["flagged_items"],
        overall_compliance_rate=result["overall_compliance_rate"],
        export_filename=result["export_filename"],
        download_url=result["download_url"],
        items=result["items"]
    )

# =============================================================================
# 4. STANDARDS RETRIEVAL, GRAPH & CLAUSE UTILITIES
# =============================================================================

@app.get("/api/v1/standards/search")
@app.get("/api/standards/search")
def search_standards(query: str = Query(..., description="Standard code or technical keyword to search"), top_k: int = 5):
    """Hybrid BM25 + Dense BGE + Cross-Encoder retrieval."""
    return {"query": query, "results": retriever.search(query, top_k=top_k)}

@app.get("/api/v1/standards/graph", response_model=KnowledgeGraphResponse)
@app.get("/api/standards/graph", response_model=KnowledgeGraphResponse)
def get_standards_graph():
    """NetworkX standards relationship graph for Cytoscape / React Flow."""
    return kg.get_serialized_graph()

@app.get("/api/v1/standards/subgraph")
def get_standards_subgraph(is_code: str = Query(..., description="IS standard code to focus subgraph on"), depth: int = 1):
    """Returns focused local subgraph around a specific standard for UI visualization."""
    return kg.export_subgraph_for_ui(is_code, depth=depth)

@app.get("/api/v1/standards/all")
@app.get("/api/standards/all")
def get_all_standards():
    """Returns all curated Indian Standards in the master registry."""
    if regulatory_engine and regulatory_engine.standards_by_code:
        return list(regulatory_engine.standards_by_code.values())
    return []

@app.get("/api/v1/qco/all")
@app.get("/api/qco/all")
def get_all_qcos():
    """Returns all gazetted mandatory Quality Control Orders."""
    if regulatory_engine and hasattr(regulatory_engine, "all_qcos"):
        return regulatory_engine.all_qcos
    return []

@app.post("/api/v1/clauses/generate", response_model=ClauseSynthesisResponse)
@app.post("/api/clauses/generate", response_model=ClauseSynthesisResponse)
def generate_clause_api(payload: ClauseSynthesisRequest):
    """Synthesizes an audit-proof Notice Inviting Tender (NIT) technical clause."""
    return clause_gen.generate_clause(
        item_category=payload.item_category,
        standard_code=payload.is_standard_code,
        include_cvc_safeguards=payload.include_cvc_safeguards,
        include_qco_mandate=payload.include_qco_mandate,
        custom_params=payload.custom_parameters
    )

# =============================================================================
# 5. AUDIT HISTORY & PAST REQUIREMENTS (NEON DB PERSISTENCE)
# =============================================================================

@app.get("/api/v1/history/requirements", response_model=RequirementHistoryResponse)
def get_past_requirements(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None, description="Filter by COMPLIANT, ACTION_REQUIRED, NON_COMPLIANT"),
    audit_type: Optional[str] = Query(None, description="Filter by TEXT, MULTIMODAL, PDF, BOQ"),
    search: Optional[str] = Query(None, description="Search term across title, department, input text, or standard"),
    db: Session = Depends(get_db)
):
    """
    Returns historical procurement requirements persisted in Neon PostgreSQL,
    strictly ordered by created_at DESC (most recent to least).
    """
    query = db.query(AuditRecord)
    if status and status != "ALL":
        query = query.filter(AuditRecord.overall_status == status)
    if audit_type and audit_type != "ALL":
        query = query.filter(AuditRecord.audit_type == audit_type)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                AuditRecord.tender_title.ilike(search_pattern),
                AuditRecord.department.ilike(search_pattern),
                AuditRecord.input_text.ilike(search_pattern),
                AuditRecord.generated_compliant_clause.ilike(search_pattern)
            )
        )

    total = query.count()
    records = query.order_by(desc(AuditRecord.created_at)).offset(offset).limit(limit).all()
    return {
        "total": total,
        "records": [r.to_dict() for r in records]
    }

@app.get("/api/v1/history/requirements/{record_id}", response_model=RequirementRecordSchema)
def get_requirement_by_id(record_id: str, db: Session = Depends(get_db)):
    """
    Fetches full audit details of a past requirement from Neon PostgreSQL.
    """
    record = db.query(AuditRecord).filter(AuditRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Requirement audit record not found")
    return record.to_dict()

@app.delete("/api/v1/history/requirements/{record_id}")
def delete_requirement_record(record_id: str, db: Session = Depends(get_db)):
    """
    Deletes an audit requirement record from Neon PostgreSQL.
    """
    record = db.query(AuditRecord).filter(AuditRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Requirement audit record not found")
    db.delete(record)
    db.commit()
    return {"status": "DELETED", "id": record_id}

@app.get("/api/v1/history/stats", response_model=AuditStatsResponse)
def get_audit_history_stats(db: Session = Depends(get_db)):
    """
    Computes aggregated compliance and scrutiny statistics from Neon PostgreSQL.
    """
    total = db.query(AuditRecord).count()
    if total == 0:
        return {
            "total_audits": 0,
            "average_compliance_score": 0.0,
            "compliant_count": 0,
            "action_required_count": 0,
            "non_compliant_count": 0,
            "critical_violations_total": 0,
            "top_standards": []
        }

    avg_score = db.query(func.avg(AuditRecord.compliance_score)).scalar() or 0.0
    compliant_count = db.query(AuditRecord).filter(AuditRecord.overall_status == "COMPLIANT").count()
    action_req_count = db.query(AuditRecord).filter(AuditRecord.overall_status == "ACTION_REQUIRED").count()
    non_compliant_count = db.query(AuditRecord).filter(AuditRecord.overall_status == "NON_COMPLIANT").count()
    crit_total = db.query(func.sum(AuditRecord.critical_issues_count)).scalar() or 0

    # Top standards query from recent 100 records
    recent_records = db.query(AuditRecord.detected_standards).order_by(desc(AuditRecord.created_at)).limit(100).all()
    std_counts = {}
    for (st_list,) in recent_records:
        if isinstance(st_list, list):
            for st in st_list:
                if isinstance(st, dict):
                    code = st.get("recommended_standard") or st.get("specified")
                    if code:
                        std_counts[code] = std_counts.get(code, 0) + 1

    top_standards = sorted(
        [{"standard": k, "count": v} for k, v in std_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    return {
        "total_audits": total,
        "average_compliance_score": round(float(avg_score), 1),
        "compliant_count": compliant_count,
        "action_required_count": action_req_count,
        "non_compliant_count": non_compliant_count,
        "critical_violations_total": int(crit_total),
        "top_standards": top_standards
    }

@app.post("/api/v1/history/seed-samples")
def seed_sample_requirements(db: Session = Depends(get_db)):
    """
    Populates Neon PostgreSQL with realistic procurement benchmark records
    if the database is currently empty.
    """
    existing = db.query(AuditRecord).count()
    if existing > 0:
        return {"status": "SKIPPED", "message": f"Database already contains {existing} audit records."}

    samples = [
        {
            "tender_title": "HDPE Water Supply Pipeline Augmentation",
            "department": "Municipal Water Supply Directorate",
            "input_text": "Supply of 110mm PE-100 HDPE Pipes PN10 rating conforming to IS 4984:1995 or ASTM D3035. Only Supreme or Astral make pipes shall be accepted by the Engineer-in-Charge. BIS ISI Mark under Pipes QCO 2020 is optional for imported consignments.",
            "compliance_score": 45,
            "overall_status": "NON_COMPLIANT",
            "critical_issues_count": 2,
            "high_issues_count": 1,
            "medium_issues_count": 0,
            "detected_standards": [
                {
                    "specified": "IS 4984:1995",
                    "status": "SUPERSEDED",
                    "recommended_standard": "IS 4984:2016",
                    "title": "High Density Polyethylene Pipes for Water Supply",
                    "is_qco_mandatory": True,
                    "qco_order": "Pipes and Fittings (Quality Control) Order, 2020"
                }
            ],
            "violations": [
                {
                    "rule_id": "CVC-BRAND-001",
                    "rule_name": "Proprietary Brand Lock-in Violation",
                    "severity": "CRITICAL",
                    "matched_text": "Supreme or Astral make",
                    "message": "CVC circular 02/02/2023 prohibits specifying restrictive commercial brand names in public tenders.",
                    "recommended_action": "Remove brand names; specify functional parameters and BIS standard certification."
                }
            ],
            "generated_compliant_clause": "Pipes shall strictly conform to IS 4984:2016 (Fifth Revision) with PE-100 material grade, PN10 rating. All consignments must bear valid BIS Standard Mark (ISI mark) under Pipes (Quality Control) Order 2020. Commercial brands are deleted pursuant to CVC directives.",
            "summary_advisory": "Audited tender: 2 critical defects, 1 high-risk violation. Overall compliance evaluated at 45%. Immediate rectification required before tender publication.",
            "audit_type": "TEXT"
        },
        {
            "tender_title": "Substation Distribution Transformers 500 kVA",
            "department": "State Electricity Distribution Co. (DISCOM)",
            "input_text": "Supply of 500 kVA 11kV/433V outdoor oil-immersed distribution transformer conforming to IS 1180:1989. Proprietary OEM components: only ABB or Siemens high-voltage bushings permitted. Compliance with Electrical Transformers QCO left to bidder declaration.",
            "compliance_score": 50,
            "overall_status": "ACTION_REQUIRED",
            "critical_issues_count": 1,
            "high_issues_count": 2,
            "medium_issues_count": 0,
            "detected_standards": [
                {
                    "specified": "IS 1180:1989",
                    "status": "WITHDRAWN",
                    "recommended_standard": "IS 1180 (Part 1):2014",
                    "title": "Outdoor Type Oil Immersed Distribution Transformers",
                    "is_qco_mandatory": True,
                    "qco_order": "Electrical Transformers (Quality Control) Order, 2014"
                }
            ],
            "violations": [
                {
                    "rule_id": "CVC-BRAND-002",
                    "rule_name": "Proprietary Bushing Brand Restrictiveness",
                    "severity": "HIGH",
                    "matched_text": "ABB or Siemens",
                    "message": "Restrictive component specification limits competition.",
                    "recommended_action": "Specify bushings conforming to IS 3347 / IS 2099."
                }
            ],
            "generated_compliant_clause": "Distribution transformers shall strictly conform to IS 1180 (Part 1):2014 with maximum total losses at 50% and 100% loading as per Energy Efficiency Level-2. Mandatorily certified under BIS Scheme-I with valid ISI mark.",
            "summary_advisory": "Audited tender: 1 critical defect, 2 high-risk violations. Compliance evaluated at 50%.",
            "audit_type": "TEXT"
        },
        {
            "tender_title": "Civil Works TMT Reinforcement Steel 16mm",
            "department": "Central Public Works Department (CPWD)",
            "input_text": "Supply of 50 Metric Tonnes Thermo-Mechanically Treated (TMT) bars 16mm diameter. Steel shall strictly be Tata Tiscon or Jindal Panther make only. Material shall conform to ASTM A615 Grade 60.",
            "compliance_score": 60,
            "overall_status": "ACTION_REQUIRED",
            "critical_issues_count": 1,
            "high_issues_count": 1,
            "medium_issues_count": 0,
            "detected_standards": [
                {
                    "specified": "ASTM A615",
                    "status": "FOREIGN",
                    "recommended_standard": "IS 1786:2008",
                    "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
                    "is_qco_mandatory": True,
                    "qco_order": "Steel and Steel Products (Quality Control) Order, 2020"
                }
            ],
            "violations": [
                {
                    "rule_id": "GFR-FOREIGN-001",
                    "rule_name": "Unjustified Foreign Standard Invocation",
                    "severity": "CRITICAL",
                    "matched_text": "ASTM A615",
                    "message": "Rule 144(vii) of GFR mandates using Indian Standards where available.",
                    "recommended_action": "Harmonize specification to IS 1786:2008 Grade Fe 500D."
                }
            ],
            "generated_compliant_clause": "Reinforcement steel shall conform to IS 1786:2008 Grade Fe 500D. Steel shall be manufactured by primary producers using virgin iron ore through BF-BOF or Corex/DRI-EAF routes. Manufacturer must possess valid BIS license.",
            "summary_advisory": "Audited tender: 1 critical defect, 1 high-risk violation. Compliance evaluated at 60%.",
            "audit_type": "TEXT"
        }
    ]

    added = 0
    for s in samples:
        related = build_related_clauses(
            target_std=s["detected_standards"][0]["recommended_standard"],
            detected_statuses=s["detected_standards"],
            violations=s["violations"],
            sample_clause=s["generated_compliant_clause"],
            title=s["tender_title"]
        )
        rec = AuditRecord(
            tender_title=s["tender_title"],
            department=s["department"],
            input_text=s["input_text"],
            compliance_score=s["compliance_score"],
            overall_status=s["overall_status"],
            critical_issues_count=s["critical_issues_count"],
            high_issues_count=s["high_issues_count"],
            medium_issues_count=s["medium_issues_count"],
            detected_standards=s["detected_standards"],
            violations=s["violations"],
            generated_compliant_clause=s["generated_compliant_clause"],
            related_clauses=related,
            summary_advisory=s["summary_advisory"],
            audit_type=s["audit_type"]
        )
        db.add(rec)
        added += 1

    db.commit()
    return {"status": "SEEDED", "records_created": added}

# Specification Draft Endpoints
@app.post("/api/v1/specifications/drafts", response_model=SpecificationDraftResponse)
def save_specification_draft(payload: SpecificationDraftCreate, db: Session = Depends(get_db)):
    """Persists an authored technical specification draft to Neon PostgreSQL."""
    draft = SpecificationDraft(
        tender_title=payload.tender_title,
        target_standard=payload.target_standard,
        compliance_score=payload.compliance_score,
        sections=payload.sections,
        compiled_text=payload.compiled_text,
        audit_id=payload.audit_id
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft.to_dict()

@app.get("/api/v1/specifications/drafts", response_model=List[SpecificationDraftResponse])
def get_specification_drafts(db: Session = Depends(get_db)):
    """Returns all saved specification drafts ordered by updated_at DESC."""
    drafts = db.query(SpecificationDraft).order_by(desc(SpecificationDraft.updated_at)).all()
    return [d.to_dict() for d in drafts]

@app.delete("/api/v1/specifications/drafts/{draft_id}")
def delete_specification_draft(draft_id: str, db: Session = Depends(get_db)):
    """Deletes a saved specification draft from Neon PostgreSQL."""
    draft = db.query(SpecificationDraft).filter(SpecificationDraft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Specification draft not found")
    db.delete(draft)
    db.commit()
    return {"status": "DELETED", "id": draft_id}

