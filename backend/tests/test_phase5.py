"""
Automated Verification Suite for Phase 5:
Multi-Modal Ingestion (PDF RFP Parser & BoQ Batch Auditor) & FastAPI Endpoints
Run via: python tests/test_phase5.py
"""
import sys
from pathlib import Path

# Ensure backend directory is in path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.services.document_parser import DocumentParser
from app.services.boq_processor import BoQProcessor


def test_phase_5():
    print("\n" + "="*70)
    print("RUNNING PHASE 5 AUTOMATED VERIFICATION SUITE")
    print("="*70)

    pdf_sample = backend_dir / "app" / "data" / "test_samples" / "flawed_water_tender.pdf"
    boq_sample = backend_dir / "app" / "data" / "test_samples" / "municipal_procurement_boq.xlsx"

    assert pdf_sample.exists(), f"Sample PDF missing: {pdf_sample}"
    assert boq_sample.exists(), f"Sample BoQ missing: {boq_sample}"

    # -------------------------------------------------------------------------
    # TEST 1: PDF Document Scrutinizer (PyMuPDF)
    # -------------------------------------------------------------------------
    print("\n[1] Testing PDF Document Scrutinizer (PyMuPDF):")
    parser = DocumentParser()

    with open(pdf_sample, "rb") as f:
        pdf_bytes = f.read()

    scorecard = parser.scrutinize_pdf(pdf_bytes, filename="flawed_water_tender.pdf")
    print(f"    • Document Name: {scorecard['document_name']}")
    print(f"    • Total Pages: {scorecard['total_pages']}")
    print(f"    • Sections Identified ({len(scorecard['sections_identified'])}): {[s['title'] for s in scorecard['sections_identified']]}")
    print(f"    • Overall Compliance Score: {scorecard['overall_compliance_score']}/100")
    print(f"    • Risk Rating: {scorecard['risk_rating']}")
    print(f"    • Extracted Brands: {scorecard['cvc_audit']['detected_brands']}")
    print(f"    • Foreign Standards: {[fc['foreign_standard'] for fc in scorecard['foreign_conversions']]}")
    print(f"    • Executive Summary: {scorecard['executive_summary']}")

    assert scorecard["total_pages"] >= 2, "PDF must have >= 2 pages"
    section_titles = [s["title"] for s in scorecard["sections_identified"]]
    assert "Technical Specifications" in section_titles, "Must detect Technical Specifications section"
    assert "Schedule of Requirements" in section_titles, "Must detect Schedule of Requirements section"
    assert scorecard["risk_rating"] == "CRITICAL", "Must flag CRITICAL risk due to withdrawn standard and CVC brands"
    assert any("Supreme" in b for b in scorecard["cvc_audit"]["detected_brands"]), "Must extract Supreme brand"
    assert any("Kirloskar" in b or "Havells" in b for b in scorecard["cvc_audit"]["detected_brands"]), "Must extract pump brands"
    assert any(fc["foreign_standard"] == "ASTM D3035" for fc in scorecard["foreign_conversions"]), "Must detect ASTM D3035"
    assert scorecard["synthesized_harmonized_clause"] is not None, "Must synthesize replacement tender clause"
    print("    --> PASS: PDF section slicing, clause parsing, and audit scorecard verified.")

    # -------------------------------------------------------------------------
    # TEST 2: Multi-Item BoQ Batch Auditor (Pandas / OpenPyXL)
    # -------------------------------------------------------------------------
    print("\n[2] Testing Multi-Item BoQ Batch Auditor (Pandas / OpenPyXL):")
    boq = BoQProcessor()

    with open(boq_sample, "rb") as f:
        boq_bytes = f.read()

    boq_result = boq.process_excel_bytes(boq_bytes, filename_prefix="audited_municipal_boq")
    print(f"    • Total Items Scanned: {boq_result['total_items_scanned']}")
    print(f"    • Compliant Items: {boq_result['compliant_items']}")
    print(f"    • Flagged Items: {boq_result['flagged_items']}")
    print(f"    • Compliance Rate: {boq_result['overall_compliance_rate']}%")
    print(f"    • Export Filename: {boq_result['export_filename']}")
    print(f"    • Download URL: {boq_result['download_url']}")

    assert boq_result["total_items_scanned"] == 20, "Must process all 20 items"
    assert boq_result["flagged_items"] >= 10, "Must flag multiple items with deliberate flaws"
    assert Path(boq_result["export_path"]).exists(), "Exported Excel spreadsheet must exist on disk"
    assert Path(boq_result["export_path"]).stat().st_size > 4000, "Export file must contain valid spreadsheet data"

    # Inspect specific line items
    items = boq_result["items"]
    
    # Item 1: HDPE Pipe (Supreme + ASTM D3035 + IS 4984:1995)
    it1 = items[0]
    print(f"\n    • Item 1 Check (HDPE Pipe):")
    print(f"      - Rec Code: {it1['recommended_is_code']}")
    print(f"      - Mandatory QCO: {it1['mandatory_qco']}")
    print(f"      - Alerts: {it1['cvc_tailoring_alerts']}")
    assert "IS 4984:2016" in it1["recommended_is_code"]
    assert "YES - ISI MARK REQUIRED" in it1["mandatory_qco"]
    assert "Supreme" in it1["cvc_tailoring_alerts"]

    # Item 5: Withdrawn Steel (IS 226:1975)
    it5 = items[4]
    print(f"\n    • Item 5 Check (Withdrawn Structural Steel):")
    print(f"      - Rec Code: {it5['recommended_is_code']}")
    print(f"      - Lifecycle: {it5['lifecycle_status']}")
    print(f"      - Action: {it5['compliance_action']}")
    assert "IS 2062:2011" in it5["recommended_is_code"]
    assert it5["lifecycle_status"] == "WITHDRAWN"
    assert "REPLACE_WITHDRAWN_STANDARD" in it5["compliance_action"]

    # Item 8: Safety Shoes (Compliant IS 15298)
    it8 = items[7]
    print(f"\n    • Item 8 Check (Compliant Safety Shoes):")
    print(f"      - Status: {it8['status']}")
    print(f"      - Action: {it8['compliance_action']}")
    assert it8["status"] == "PASS"
    assert it8["compliance_action"] in ["APPROVED", "MANDATE_QCO_ISI_MARK"]

    print("    --> PASS: BoQ batch processing, 6 standardized columns, and spreadsheet export verified.")

    # -------------------------------------------------------------------------
    # TEST 3: FastAPI Endpoints (AsyncClient + ASGITransport)
    # -------------------------------------------------------------------------
    print("\n[3] Testing FastAPI Endpoints (AsyncClient + ASGITransport):")
    import asyncio
    from httpx import AsyncClient, ASGITransport
    from app.main import lifespan

    async def run_api_tests():
        async with lifespan(app):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                # 3A. Health Check
                res_health = await client.get("/health")
                assert res_health.status_code == 200
                assert res_health.json()["status"] == "healthy"
                print("    • [GET /health] -> 200 OK")

                # 3B. Single Specification Text Audit (POST /api/v1/audit/text)
                payload_text = {
                    "tender_id": "TEST-TND-01",
                    "title": "Municipal Drinking Water HDPE Pipes",
                    "text_content": "Supply of 110mm Supreme HDPE pipes conforming to ASTM D3035 and obsolete IS 4984:1995."
                }
                res_text = await client.post("/api/v1/audit/text", json=payload_text)
                print(f"    • [POST /api/v1/audit/text] -> {res_text.status_code}")
                assert res_text.status_code == 200
                data_text = res_text.json()
                assert data_text["compliance_score"] < 60
                assert data_text["overall_status"] in ["ACTION_REQUIRED", "NON_COMPLIANT"]
                assert len(data_text["violations"]) >= 2
                assert "IS 4984:2016" in data_text["generated_compliant_clause"]

                # 3C. Side-by-Side Harmonization (POST /api/v1/harmonize)
                res_diff = await client.post("/api/v1/harmonize", data={"original_text": payload_text["text_content"], "item_category": "HDPE Pipes"})
                print(f"    • [POST /api/v1/harmonize] -> {res_diff.status_code}")
                assert res_diff.status_code == 200
                data_diff = res_diff.json()
                assert "Supreme" in data_diff["removed_brands"]
                assert "IS 4984:2016" in data_diff["harmonized_text"]
                assert len(data_diff["diff_summary"]) >= 2

                # 3D. PDF RFP Upload (POST /api/v1/audit/rfp)
                with open(pdf_sample, "rb") as f:
                    res_pdf = await client.post("/api/v1/audit/rfp", files={"file": ("flawed_tender.pdf", f, "application/pdf")})
                print(f"    • [POST /api/v1/audit/rfp] -> {res_pdf.status_code}")
                assert res_pdf.status_code == 200
                data_pdf = res_pdf.json()
                assert data_pdf["risk_rating"] == "CRITICAL"
                assert len(data_pdf["sections_identified"]) >= 2

                # 3E. Excel BoQ Upload (POST /api/v1/audit/boq)
                with open(boq_sample, "rb") as f:
                    res_boq = await client.post(
                        "/api/v1/audit/boq",
                        files={"file": ("municipal_boq.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
                    )
                print(f"    • [POST /api/v1/audit/boq] -> {res_boq.status_code}")
                assert res_boq.status_code == 200
                data_boq = res_boq.json()
                assert data_boq["total_items_scanned"] == 20
                assert "/static/exports/" in data_boq["download_url"]

                # 3F. Standards Search (GET /api/v1/standards/search)
                res_search = await client.get("/api/v1/standards/search?query=HDPE%20pipe%20potable%20water&top_k=3")
                print(f"    • [GET /api/v1/standards/search] -> {res_search.status_code}")
                assert res_search.status_code == 200
                search_data = res_search.json()
                assert len(search_data["results"]) >= 1
                assert "IS 4984" in search_data["results"][0]["is_code"]

                # 3G. Knowledge Graph Endpoint (GET /api/v1/standards/graph)
                res_graph = await client.get("/api/v1/standards/graph")
                print(f"    • [GET /api/v1/standards/graph] -> {res_graph.status_code}")
                assert res_graph.status_code == 200
                graph_data = res_graph.json()
                assert len(graph_data["nodes"]) > 50
                assert len(graph_data["edges"]) > 50

                # 3H. Clause Generation (POST /api/v1/clauses/generate)
                res_clause = await client.post("/api/v1/clauses/generate", json={
                    "item_category": "Distribution Transformers",
                    "is_standard_code": "IS 1180 (Part 1):2014"
                })
                print(f"    • [POST /api/v1/clauses/generate] -> {res_clause.status_code}")
                assert res_clause.status_code == 200
                assert "IS 1180 (Part 1):2014" in res_clause.json()["synthesized_clause_text"]

                print("    --> PASS: All FastAPI v1 and legacy endpoints verified.")

    asyncio.run(run_api_tests())

    print("\n" + "="*70)
    print("ALL PHASE 5 TESTS PASSED WITH ZERO ERRORS!")
    print("="*70 + "\n")


if __name__ == "__main__":
    test_phase_5()
