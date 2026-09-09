from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional

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
    ClauseSynthesisResponse
)
from app.services.hybrid_retriever import HybridRetriever
from app.services.knowledge_graph import StandardsKnowledgeGraph
from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter
from app.services.document_parser import DocumentParser
from app.services.boq_processor import BoQProcessor
from app.services.clause_generator import ClauseGenerator

# Global singletons
retriever: Optional[HybridRetriever] = None
kg: Optional[StandardsKnowledgeGraph] = None
regulatory_engine: Optional[RegulatoryEngine] = None
cvc_linter: Optional[CVCLinter] = None
doc_parser: Optional[DocumentParser] = None
boq_processor: Optional[BoQProcessor] = None
clause_gen: Optional[ClauseGenerator] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize engine services on startup
    global retriever, kg, regulatory_engine, cvc_linter, doc_parser, boq_processor, clause_gen
    retriever = HybridRetriever()
    kg = StandardsKnowledgeGraph()
    regulatory_engine = RegulatoryEngine()
    cvc_linter = CVCLinter()
    doc_parser = DocumentParser()
    boq_processor = BoQProcessor()
    clause_gen = ClauseGenerator()
    print("ManakSetu Engine initialized successfully.")
    yield
    print("ManakSetu Engine shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Intelligent BIS Compliance, Tender Scrutiny, and BoQ Auditing System",
    lifespan=lifespan
)

# Setup CORS
setup_cors(app)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/audit/tender", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
def audit_tender_text(payload: TenderAuditRequest):
    standards_extracted = regulatory_engine.extract_standards_from_text(payload.text_content)
    detected_statuses = [regulatory_engine.validate_standard(s) for s in standards_extracted]
    violations = cvc_linter.scan(payload.text_content)

    critical_count = sum(1 for v in violations if v["severity"] == "CRITICAL")
    high_count = sum(1 for v in violations if v["severity"] == "HIGH")
    medium_count = sum(1 for v in violations if v["severity"] == "MEDIUM")

    obsolete_count = sum(1 for s in detected_statuses if s["status"] == "OBSOLETE")
    high_count += obsolete_count

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
    if detected_statuses:
        best_std = detected_statuses[0].get("recommended_standard") or detected_statuses[0].get("specified")
        if best_std:
            res = clause_gen.generate_clause(
                item_category=payload.title or "Procurement Item",
                standard_code=best_std
            )
            sample_clause = res["synthesized_clause_text"]

    summary = (
        f"Audited tender: {critical_count} critical defects, {high_count} high-risk violations. "
        f"Overall compliance evaluated at {score}%. "
        + ("Immediate rectification required before publication." if score < 70 else "Minor revisions suggested.")
    )

    return TenderAuditResponse(
        tender_id=payload.tender_id or "TND-AUDIT",
        compliance_score=score,
        overall_status=overall_status,
        critical_issues_count=critical_count,
        high_issues_count=high_count,
        medium_issues_count=medium_count,
        detected_standards=detected_statuses,
        violations=violations,
        generated_compliant_clause=sample_clause,
        summary_advisory=summary
    )

@app.post("/api/audit/upload-pdf", response_model=TenderAuditResponse, dependencies=[Depends(check_rate_limit)])
async def audit_pdf_upload(file: UploadFile = File(...), tender_id: Optional[str] = Form("PDF-UPLOAD")):
    contents = await file.read()
    parse_res = doc_parser.parse_pdf_bytes(contents)
    text = parse_res.get("text", "")

    req = TenderAuditRequest(
        tender_id=tender_id,
        title=file.filename or "Uploaded Tender PDF",
        text_content=text
    )
    return audit_tender_text(req)

@app.post("/api/boq/upload-excel", response_model=BoqAuditResponse, dependencies=[Depends(check_rate_limit)])
async def audit_boq_excel(file: UploadFile = File(...), tender_id: Optional[str] = Form("EXCEL-BOQ")):
    contents = await file.read()
    result = boq_processor.process_excel_bytes(contents)
    return BoqAuditResponse(
        tender_id=tender_id,
        total_items_scanned=result["total_items_scanned"],
        compliant_items=result["compliant_items"],
        flagged_items=result["flagged_items"],
        overall_compliance_rate=result["overall_compliance_rate"],
        items=result["items"]
    )

@app.get("/api/standards/search")
def search_standards(query: str = Query(..., description="Standard or keyword to search"), top_k: int = 5):
    return {"query": query, "results": retriever.search(query, top_k=top_k)}

@app.get("/api/standards/graph", response_model=KnowledgeGraphResponse)
def get_standards_graph():
    return kg.get_serialized_graph()

@app.post("/api/clauses/generate", response_model=ClauseSynthesisResponse)
def generate_clause(payload: ClauseSynthesisRequest):
    return clause_gen.generate_clause(
        item_category=payload.item_category,
        standard_code=payload.is_standard_code,
        include_cvc_safeguards=payload.include_cvc_safeguards,
        include_qco_mandate=payload.include_qco_mandate,
        custom_params=payload.custom_parameters
    )
