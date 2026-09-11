"""
Automated First-Round Jury Edge Case Verification Suite
Tests critical edge cases, boundary conditions, zero-hardcoding rules,
and referential integrity across the StandardSense pipeline.
"""
import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from app.services.nlp_extractor import ParameterExtractor
from app.services.knowledge_graph import StandardsKnowledgeGraph
from app.services.foreign_converter import ForeignConverter
from app.services.clause_generator import ClauseGenerator
from app.services.regulatory_engine import RegulatoryEngine
from app.services.document_parser import DocumentParser
import json
from app.core.config import settings

def test_nlp_extractor_no_false_positive_is():
    """Verify that English verb 'is' in 'pipe is 200mm' is not misidentified as an Indian Standard."""
    extractor = ParameterExtractor()
    sample_text = "The HDPE pipe is 200mm in diameter and is suitable for gravity flow."
    extracted = extractor.extract(sample_text)
    cited = extracted["cited_standards"]
    for c in cited:
        assert not c.strip().lower().startswith("is 200"), f"False positive Indian Standard detected: {c}"

def test_subgraph_depth_query():
    """Verify that export_subgraph_for_ui supports the depth parameter and does bounded expansion."""
    kg = StandardsKnowledgeGraph()
    sub_1 = kg.export_subgraph_for_ui("IS 4984:2016", depth=1)
    sub_2 = kg.export_subgraph_for_ui("IS 4984:2016", depth=2)
    assert len(sub_1["nodes"]) > 0, "Depth 1 must return nodes"
    assert len(sub_2["nodes"]) >= len(sub_1["nodes"]), "Depth 2 must contain at least as many nodes as Depth 1"
    root = next((n for n in sub_1["nodes"] if n.get("is_root")), None)
    assert root is not None, "Root node must be tagged with is_root=True"

def test_foreign_converter_boundary_matching():
    """Verify that foreign converter only matches on token/delimiter boundaries."""
    converter = ForeignConverter()
    res = converter.convert_code("ASTM D3035-2015")
    assert res is not None, "ASTM D3035-2015 should match ASTM D3035 via delimiter"
    assert res["equivalent_is_code"] == "IS 4984:2016"

def test_clause_generator_zero_hardcoded_hdpe_fallback():
    """Verify that clause generator does not fall back to IS 4984:2016 when given unmapped generic goods."""
    gen = ClauseGenerator()
    unmapped_text = "Supply of 100% organic cotton surgeon gowns and surgical masks."
    res = gen.generate_harmonized_diff(unmapped_text, target_standard=None, item_category="Surgical Goods")
    assert res["target_standard"] is None, "Target standard must be None when unmapped"
    assert "IS 4984:2016" not in res["harmonized_text"], "Must NOT inject HDPE pipe standard into surgical goods"

def test_regulatory_engine_zero_hardcoded_steel_fallback():
    """Verify that regulatory engine does not fall back to IS 2062:2011 if a withdrawn standard lacks replacement."""
    engine = RegulatoryEngine()
    dummy_code = "IS 99999"
    engine.withdrawn_standards[dummy_code] = {
        "title": "Withdrawn Dummy Standard",
        "withdrawn_date": "2015-01-01",
        "replacement_standard": None
    }
    val = engine.check_lifecycle(dummy_code)
    assert val["status"] == "WITHDRAWN"
    assert val["recommended_standard"] is None, "Should not fallback to IS 2062:2011"
    assert "IS 2062:2011" not in val["notes"]

def test_qco_referential_integrity():
    """Verify that all QCO records in qco_master.json have required gazette fields and referential integrity."""
    qco_path = settings.QCO_MASTER_PATH
    assert qco_path.exists(), "QCO master file must exist"
    with open(qco_path, "r", encoding="utf-8") as f:
        qcos = json.load(f)
    assert len(qcos) >= 5, "Must have curated QCO entries"
    for q in qcos:
        qid = q.get("qco_id") or q.get("order_id")
        assert qid, "Every QCO must have an identifier"
        assert q.get("order_title"), f"QCO {qid} missing order_title"
        assert q.get("scheme"), f"QCO {qid} missing certification scheme"

def test_document_parser_empty_scanned_pdf():
    """Verify that an empty/scanned PDF without text returns critical risk instead of 100% compliant."""
    parser = DocumentParser()
    empty_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    scorecard = parser.scrutinize_pdf(empty_bytes, filename="empty_scanned_tender.pdf")
    assert scorecard["risk_rating"] == "CRITICAL", "Empty/scanned document must trigger CRITICAL risk rating"
    assert scorecard["overall_compliance_score"] == 0.0, "Score must be 0 for unreadable document"
    assert "INSUFFICIENT TEXT EXTRACTED" in scorecard["executive_summary"]
