from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional, Dict, Any, List

from app.core.config import settings
from app.core.security import setup_cors, check_rate_limit
from app.schemas.request_schemas import (
    TenderAuditRequest,
    StandardSearchRequest,
    BoqAuditRequest,
    ClauseSynthesisRequest,
    HarmonizeRequest,
    StandardDetailRequest
)
from app.schemas.response_schemas import (
    TenderAuditResponse,
    BoqAuditResponse,
    KnowledgeGraphResponse,
    ClauseSynthesisResponse
)
from app.services.hybrid_retriever import HybridRetriever
from app.services.knowledge_graph import StandardsKnowledgeGraph
from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter
from app.services.foreign_converter import ForeignConverter
from app.services.document_parser import DocumentParser
from app.services.boq_processor import BoQProcessor
from app.services.clause_generator import ClauseGenerator

# Global singletons
retriever: Optional[HybridRetriever] = None
kg: Optional[StandardsKnowledgeGraph] = None
regulatory_engine: Optional[RegulatoryEngine] = None
cvc_linter: Optional[CVCLinter] = None
foreign_converter: Optional[ForeignConverter] = None
doc_parser: Optional[DocumentParser] = None
boq_processor: Optional[BoQProcessor] = None
clause_gen: Optional[ClauseGenerator] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize engine services on startup
    global retriever, kg, regulatory_engine, cvc_linter, foreign_converter, doc_parser, boq_processor, clause_gen
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

# =============================================================================
# 1. TEXT AUDIT & SPECIFICATION HARMONIZER (PHASE 2, 3, 4)
# =============================================================================

@app.post("/api/v1/audit/text", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
@app.post("/api/audit/tender", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
@app.post("/api/audit/full", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
def audit_tender_text(payload: TenderAuditRequest):
    """
    Audits a single procurement specification string:
    - Extracts cited Indian Standards, evaluates lifecycle (CURRENT vs SUPERSEDED vs WITHDRAWN)
    - Checks gazetted QCO orders under Section 16 of the BIS Act, 2016
    - Scans for proprietary brand names and CVC anti-tailoring violations
    - Converts foreign standards under GFR 144(vii)
    - Synthesizes an audit-proof Notice Inviting Tender (NIT) clause
    """
    raw_text = payload.get_text()
    standards_audit = regulatory_engine.audit_text_standards(raw_text)
    detected_statuses = standards_audit["audits"]
    cvc_audit = cvc_linter.audit_text(raw_text)
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
        search_res = retriever.search(raw_text, top_k=1)
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

    return TenderAuditResponse(
        tender_id=payload.tender_id or "TND-AUDIT",
        compliance_score=int(score),
        overall_status=overall_status,
        critical_issues_count=critical_count,
        high_issues_count=high_count,
        medium_issues_count=medium_count,
        detected_standards=detected_statuses,
        violations=violations,
        generated_compliant_clause=sample_clause,
        summary_advisory=summary
    )

@app.post("/api/v1/harmonize", dependencies=[Depends(check_rate_limit)])
@app.post("/api/clause/generate-harmonized", dependencies=[Depends(check_rate_limit)])
async def harmonize_text(request: Request):
    """
    Generates side-by-side comparison payload (Original vs Harmonized).
    Accepts either JSON (HarmonizeRequest) or Form data seamlessly.
    """
    content_type = request.headers.get("content-type", "").lower()
    text = None
    std = None
    cat = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            text = body.get("original_text") or body.get("text")
            std = body.get("target_standard")
            cat = body.get("item_category") or body.get("category")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            text = form.get("original_text") or form.get("text")
            std = form.get("target_standard")
            cat = form.get("item_category") or form.get("category")
        except Exception:
            pass

    if not text:
        raise HTTPException(status_code=400, detail="Missing required 'original_text' or 'text' parameter.")

    return clause_gen.generate_harmonized_diff(
        original_text=str(text).strip(),
        target_standard=str(std).strip() if std else None,
        item_category=str(cat).strip() if cat else None
    )

# =============================================================================
# 2. PDF RFP SCRUTINIZER (PHASE 5)
# =============================================================================

@app.post("/api/v1/audit/rfp", dependencies=[Depends(check_rate_limit)])
@app.post("/api/audit/upload-pdf", dependencies=[Depends(check_rate_limit)])
@app.post("/api/document/parse", dependencies=[Depends(check_rate_limit)])
async def audit_pdf_upload(file: UploadFile = File(...), tender_id: Optional[str] = Form("PDF-TENDER")):
    """
    Multi-modal PDF RFP Scrutinizer:
    - Slices Technical Specifications, Schedule of Requirements, and Scope of Supply
    - Audits every clause against BIS standards, QCO orders, and CVC rules
    - Produces a consolidated executive Audit Scorecard
    """
    contents = await file.read()
    filename = file.filename or "uploaded_tender.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files (.pdf) are supported by this endpoint.")

    scorecard = doc_parser.scrutinize_pdf(contents, filename=filename)
    scorecard["tender_id"] = tender_id
    return scorecard

# =============================================================================
# 3. EXCEL BOQ BATCH AUDITOR (PHASE 5)
# =============================================================================

@app.post("/api/v1/audit/boq", response_model=BoqAuditResponse, dependencies=[Depends(check_rate_limit)])
@app.post("/api/boq/upload-excel", response_model=BoqAuditResponse, dependencies=[Depends(check_rate_limit)])
@app.post("/api/boq/audit", response_model=BoqAuditResponse, dependencies=[Depends(check_rate_limit)])
async def audit_boq_excel(file: UploadFile = File(...), tender_id: Optional[str] = Form("EXCEL-BOQ")):
    """
    Multi-Item Excel BoQ Batch Auditor:
    - Automatically detects item description, quantity, and unit columns
    - Validates each row against BIS catalog, QCO orders, and CVC anti-tailoring rules
    - Appends 6 standardized audit columns and provides an instant export download link
    """
    contents = await file.read()
    filename = file.filename or "uploaded_boq.xlsx"
    if not (filename.lower().endswith(".xlsx") or filename.lower().endswith(".xls")):
        raise HTTPException(status_code=400, detail="Only Excel spreadsheets (.xlsx, .xls) are supported by this endpoint.")

    prefix = Path(filename).stem
    result = boq_processor.process_excel_bytes(contents, filename_prefix=f"audited_{prefix}")
    
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

@app.post("/api/standards/details")
def get_standard_details(payload: StandardDetailRequest):
    """Provides focused subgraph details for the requested standard."""
    return {
        "code": payload.code,
        "subgraph": kg.export_subgraph_for_ui(payload.code, depth=payload.depth)
    }

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
