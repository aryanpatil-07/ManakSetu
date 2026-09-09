"""
Automated Verification Suite for Phase 3:
Deterministic Regulatory, QCO & Standard Lifecycle Engine
Run via: python tests/test_phase3.py
"""
import sys
from pathlib import Path

# Ensure backend directory is in path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.regulatory_engine import RegulatoryEngine
from app.services.knowledge_graph import StandardsKnowledgeGraph


def test_phase_3():
    print("\n" + "="*70)
    print("RUNNING PHASE 3 AUTOMATED VERIFICATION SUITE")
    print("="*70)

    kg = StandardsKnowledgeGraph()
    engine = RegulatoryEngine(kg=kg)

    # -------------------------------------------------------------------------
    # TEST 1: Code Normalization & Natural Language Extraction
    # -------------------------------------------------------------------------
    print("\n[1] Testing Standard Code Normalization & Regex Extraction:")
    norm1 = engine.normalize_standard_code("IS:4984:1995")
    norm2 = engine.normalize_standard_code("IS4984-2016")
    norm3 = engine.normalize_standard_code("IS 4984 : 2016")
    norm4 = engine.normalize_standard_code("IS 1180(Part 1):2014")
    norm5 = engine.normalize_standard_code("is 10322 (part 5/sec 3):2012")

    print(f"    • 'IS:4984:1995'                -> '{norm1}'")
    print(f"    • 'IS4984-2016'                 -> '{norm2}'")
    print(f"    • 'IS 4984 : 2016'              -> '{norm3}'")
    print(f"    • 'IS 1180(Part 1):2014'        -> '{norm4}'")
    print(f"    • 'is 10322 (part 5/sec 3):2012' -> '{norm5}'")

    assert norm1 == "IS 4984:1995", f"Expected 'IS 4984:1995', got '{norm1}'"
    assert norm2 == "IS 4984:2016", f"Expected 'IS 4984:2016', got '{norm2}'"
    assert norm3 == "IS 4984:2016", f"Expected 'IS 4984:2016', got '{norm3}'"
    assert "IS 1180 (Part 1):2014" in norm4, f"Failed on IS 1180: '{norm4}'"
    assert "IS 10322 (Part 5/Sec 3):2012" in norm5, f"Failed on IS 10322: '{norm5}'"

    raw_rfp_text = (
        "Supply of 500m HDPE pipe conforming to IS:4984:1995 or IS 4984-2016 with "
        "distribution transformer as per IS 1180 (Part 1):1989 and structural steel per IS:2062."
    )
    extracted = engine.extract_standards_from_text(raw_rfp_text)
    print(f"    • Extracted standards from RFP text: {extracted}")
    assert any("4984" in s for s in extracted), "Must extract IS 4984"
    assert any("1180" in s for s in extracted), "Must extract IS 1180"
    assert any("2062" in s for s in extracted), "Must extract IS 2062"
    print("    --> PASS: Normalization and extraction verified.")

    # -------------------------------------------------------------------------
    # TEST 2: Lifecycle State Validation (CURRENT, SUPERSEDED, WITHDRAWN, UNSPECIFIED)
    # -------------------------------------------------------------------------
    print("\n[2] Testing Lifecycle State Validator:")
    
    # 2A. CURRENT Active Revision
    res_curr = engine.check_lifecycle("IS 4984:2016")
    print(f"    • [CURRENT] IS 4984:2016 -> State: {res_curr['lifecycle_state']}, Status: {res_curr['status']}")
    assert res_curr["lifecycle_state"] == "CURRENT"
    assert res_curr["status"] == "ACTIVE"
    assert res_curr["is_current"] is True
    assert res_curr["alert_level"] == "NONE"
    assert len(res_curr["active_amendments"]) >= 2, "Must list active amendments"

    # 2B. SUPERSEDED (Explicit in supersedes list)
    res_sup = engine.check_lifecycle("IS 4984:1995")
    print(f"    • [SUPERSEDED] IS 4984:1995 -> State: {res_sup['lifecycle_state']}, Recommended: {res_sup['recommended_standard']}")
    assert res_sup["lifecycle_state"] == "SUPERSEDED"
    assert res_sup["status"] == "OBSOLETE"
    assert res_sup["alert_level"] == "CRITICAL"
    assert res_sup["recommended_standard"] == "IS 4984:2016"
    assert "IS 4984:2016" in res_sup["superseded_by"]

    # 2C. SUPERSEDED (Year comparison)
    res_sup2 = engine.check_lifecycle("IS 1180 (Part 1):1989")
    print(f"    • [SUPERSEDED YEAR] IS 1180 (Part 1):1989 -> Recommended: {res_sup2['recommended_standard']}")
    assert res_sup2["lifecycle_state"] == "SUPERSEDED"
    assert res_sup2["status"] == "OBSOLETE"
    assert "2014" in res_sup2["recommended_standard"]

    # 2D. WITHDRAWN Standard
    res_withdrawn = engine.check_lifecycle("IS 226:1975")
    print(f"    • [WITHDRAWN] IS 226:1975 -> State: {res_withdrawn['lifecycle_state']}, Alert: {res_withdrawn['alert_badge']}")
    assert res_withdrawn["lifecycle_state"] == "WITHDRAWN"
    assert res_withdrawn["status"] == "WITHDRAWN"
    assert res_withdrawn["alert_level"] == "CRITICAL"
    assert "IS 2062" in res_withdrawn["recommended_standard"]

    # 2E. UNSPECIFIED Revision Year
    res_unspecified = engine.check_lifecycle("IS 4984")
    print(f"    • [UNSPECIFIED] IS 4984 -> State: {res_unspecified['lifecycle_state']}, Recommended: {res_unspecified['recommended_standard']}")
    assert res_unspecified["lifecycle_state"] == "UNSPECIFIED"
    assert res_unspecified["status"] == "UNSPECIFIED_REVISION"
    assert res_unspecified["alert_level"] == "WARNING"
    assert res_unspecified["recommended_standard"] == "IS 4984:2016"
    print("    --> PASS: All lifecycle transitions and alert states verified.")

    # -------------------------------------------------------------------------
    # TEST 3: Quality Control Order (QCO) Mandatory Compliance Engine
    # -------------------------------------------------------------------------
    print("\n[3] Testing Mandatory QCO Compliance Engine:")
    
    # 3A. Scheme-I (ISI Mark) - DPIIT Plastic Pipes QCO
    qco_pipe = engine.check_qco_compliance("IS 4984:2016")
    print(f"    • [QCO Scheme-I] IS 4984 -> Mandatory: {qco_pipe['is_qco_mandatory']}, Scheme: {qco_pipe['scheme']}")
    assert qco_pipe["is_qco_mandatory"] is True
    assert "Scheme-I" in qco_pipe["scheme"]
    assert "DPIIT" in qco_pipe["notifying_ministry"] or "Commerce" in qco_pipe["notifying_ministry"]
    assert "S.O. 4321(E)" in qco_pipe["gazette_notification_no"]
    assert "Section 16" in qco_pipe["statutory_clause"]
    assert "Section 29" in qco_pipe["penalty_clause"]

    # 3B. Scheme-I (ISI Mark) - Ministry of Steel Rebars QCO
    qco_steel = engine.check_qco_compliance("IS 1786:2008")
    print(f"    • [QCO Steel] IS 1786 -> Order: {qco_steel['order_title']}, Ministry: {qco_steel['notifying_ministry']}")
    assert qco_steel["is_qco_mandatory"] is True
    assert "Steel" in qco_steel["notifying_ministry"]
    assert "Scheme-I" in qco_steel["scheme"]

    # 3C. Scheme-II (CRS) - MeitY Electronics QCO
    qco_it = engine.check_qco_compliance("IS 13252 (Part 1):2010")
    print(f"    • [QCO Scheme-II CRS] IS 13252 -> Scheme: {qco_it['scheme']}")
    assert qco_it["is_qco_mandatory"] is True
    assert "Scheme-II" in qco_it["scheme"] or "CRS" in qco_it["scheme"]

    # 3D. Voluntary Standard
    qco_vol = engine.check_qco_compliance("IS 99999:2099")
    print(f"    • [Voluntary / Non-QCO] IS 99999 -> Mandatory: {qco_vol['is_qco_mandatory']}, Type: {qco_vol['compliance_type']}")
    assert qco_vol["is_qco_mandatory"] is False
    assert qco_vol["compliance_type"] == "VOLUNTARY"
    print("    --> PASS: Mandatory QCO detection, statutory clauses, and schemes verified.")

    # -------------------------------------------------------------------------
    # TEST 4: Normative Dependency Traverser & Inspection Checklist
    # -------------------------------------------------------------------------
    print("\n[4] Testing Normative Testing Schedule & Checklist Assembler:")
    bundle = engine.get_normative_testing_bundle("IS 4984:2016")
    print(f"    • Raw Materials: {bundle['raw_materials']}")
    print(f"    • Testing Protocols: {bundle['testing_methods']}")
    print(f"    • Inspection Checklist Items: {len(bundle['inspection_checklist'])}")
    for item in bundle["inspection_checklist"]:
        print(f"      - {item}")

    assert any("7328" in m for m in bundle["raw_materials"]), "IS 7328 must be in raw materials for HDPE pipe"
    assert any("12235" in t for t in bundle["testing_methods"]), "IS 12235 must be in testing standards"
    assert len(bundle["inspection_checklist"]) >= 3, "Must produce comprehensive inspection checklist"
    print("    --> PASS: Normative testing bundles and inspection checklists verified.")

    # -------------------------------------------------------------------------
    # TEST 5: Comprehensive RFP Specification Text Audit
    # -------------------------------------------------------------------------
    print("\n[5] Testing Full RFP Text Audit & Risk Scoring:")
    
    # 5A. High-Risk Tender (withdrawn + superseded + mandatory QCO)
    bad_rfp = (
        "Project: Municipal Water Supply & Steel Bridge Structure.\n"
        "Specifications: High density polyethylene pipes conforming to obsolete IS 4984:1995.\n"
        "Structural steel sections shall conform to IS 226:1975.\n"
        "Reinforcement steel bars shall conform to IS 1786:2008."
    )
    audit_bad = engine.audit_text_standards(bad_rfp)
    print(f"    • Bad RFP Audit:")
    print(f"      - Total Standards Cited: {audit_bad['total_standards_cited']}")
    print(f"      - Superseded: {audit_bad['superseded_count']}, Withdrawn: {audit_bad['withdrawn_count']}")
    print(f"      - QCO Mandatory Items: {audit_bad['qco_mandatory_count']}")
    print(f"      - Overall Risk Level: {audit_bad['risk_level']}")
    print(f"      - Compliance Status: {audit_bad['compliance_status']}")
    print(f"      - Statutory Clauses Injected: {len(audit_bad['statutory_clauses'])}")

    assert audit_bad["total_standards_cited"] == 3
    assert audit_bad["superseded_count"] == 1, "IS 4984:1995 must be counted as superseded"
    assert audit_bad["withdrawn_count"] == 1, "IS 226:1975 must be counted as withdrawn"
    assert audit_bad["risk_level"] == "CRITICAL", "Withdrawn standard must flag CRITICAL risk"
    assert len(audit_bad["statutory_clauses"]) >= 1, "Must inject statutory clauses for QCO items"

    # 5B. Clean, Compliant Tender
    clean_rfp = (
        "Supply of potable drinking water distribution network pipes conforming strictly "
        "to IS 4984:2016 with all active amendments."
    )
    audit_clean = engine.audit_text_standards(clean_rfp)
    print(f"\n    • Clean RFP Audit:")
    print(f"      - Risk Level: {audit_clean['risk_level']}")
    print(f"      - Compliance Status: {audit_clean['compliance_status']}")
    assert audit_clean["risk_level"] == "LOW"
    assert audit_clean["compliance_status"] == "FULLY_COMPLIANT"
    assert audit_clean["superseded_count"] == 0
    assert audit_clean["withdrawn_count"] == 0
    print("    --> PASS: Comprehensive RFP audit and risk scoring verified.")

    # -------------------------------------------------------------------------
    # TEST 6: Backward Compatibility Check with Existing Services
    # -------------------------------------------------------------------------
    print("\n[6] Testing Backwards Compatibility of validate_standard():")
    val = engine.validate_standard("IS 4984:1995")
    assert "status" in val, "Must retain 'status' key"
    assert "recommended_standard" in val, "Must retain 'recommended_standard' key"
    assert "title" in val, "Must retain 'title' key"
    assert "is_qco_mandatory" in val, "Must retain 'is_qco_mandatory' key"
    assert "qco_order" in val, "Must retain 'qco_order' key"
    assert "notes" in val, "Must retain 'notes' key"
    assert val["status"] == "OBSOLETE"
    assert val["recommended_standard"] == "IS 4984:2016"
    assert val["is_qco_mandatory"] is True
    print("    --> PASS: Complete backward compatibility verified.")

    print("\n" + "="*70)
    print("ALL PHASE 3 TESTS PASSED WITH ZERO ERRORS!")
    print("="*70 + "\n")


if __name__ == "__main__":
    test_phase_3()
