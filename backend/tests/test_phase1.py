"""
Automated Verification Suite for Phase 1: Data Architecture & Knowledge Graph
Run via: python -m pytest tests/test_phase1.py -v (or python tests/test_phase1.py)
"""
import sys
import os
import re
from pathlib import Path

# Ensure backend directory is in path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.knowledge_graph import StandardsKnowledgeGraph
import json

def test_phase_1():
    print("\n" + "="*70)
    print("RUNNING PHASE 1 AUTOMATED VERIFICATION SUITE")
    print("="*70)

    kg = StandardsKnowledgeGraph()
    stats = kg.get_graph_stats()
    print(f"\n[1] Graph Construction & Stats:")
    print(f"    • Total Nodes: {stats['total_nodes']}")
    print(f"    • Total Edges: {stats['total_edges']}")
    print(f"    • Standards Indexed: {stats['standards_count']}")
    print(f"    • QCO Orders: {stats['qco_orders_count']}")
    print(f"    • Foreign Mappings: {stats['foreign_mappings_count']}")
    print(f"    • Node Breakdown: {stats['node_types']}")

    assert stats["standards_count"] >= 25, "Standards count must be >= 25"
    assert stats["qco_orders_count"] >= 10, "QCO orders must be >= 10"
    assert stats["foreign_mappings_count"] >= 10, "Foreign mappings must be >= 10"
    assert stats["total_nodes"] > 50, "Total graph nodes must exceed 50"
    print("    --> PASS: Graph structure and scale verified.")

    # 2. Golden Case A: Municipal Water Pipeline (IS 4984:2016)
    print(f"\n[2] Testing Golden Case A: Municipal Water Pipeline (IS 4984:2016)")
    bundle_a = kg.get_normative_bundle("IS 4984:2016")
    assert bundle_a["status"] == "CURRENT", "IS 4984:2016 must be CURRENT"
    assert bundle_a["is_qco_mandatory"] is True, "QCO must be mandatory for HDPE pipes"
    assert bundle_a["qco_details"]["scheme"] == "Scheme-I (ISI Mark)", "Scheme must be Scheme-I"
    
    # Check testing and raw material standards
    raw_mats_a = [m["code"] for m in bundle_a["raw_materials"]]
    tests_a = [t["code"] for t in bundle_a["testing_methods"]]
    print(f"    • Raw Materials: {raw_mats_a}")
    print(f"    • Testing Standards: {tests_a}")
    print(f"    • QCO Title: {bundle_a['qco_details']['order_title']}")
    
    assert any("7328" in m for m in raw_mats_a), "IS 7328 must be in raw materials for HDPE pipe"
    assert any("12235" in t for t in tests_a), "IS 12235 must be in testing standards"
    assert any("2530" in t for t in tests_a), "IS 2530 must be in testing standards"
    print("    --> PASS: Case A normative bundle and QCO linkages verified.")

    # 3. Golden Case B: Distribution Transformers (IS 1180 (Part 1):2014)
    print(f"\n[3] Testing Golden Case B: Distribution Transformers (IS 1180 (Part 1):2014)")
    bundle_b = kg.get_normative_bundle("IS 1180 (Part 1):2014")
    assert bundle_b["status"] == "CURRENT", "IS 1180 must be CURRENT"
    assert bundle_b["is_qco_mandatory"] is True, "QCO must be mandatory for transformers"
    raw_mats_b = [m["code"] for m in bundle_b["raw_materials"]]
    tests_b = [t["code"] for t in bundle_b["testing_methods"]]
    print(f"    • Raw Materials: {raw_mats_b}")
    print(f"    • Testing Standards: {tests_b}")
    print(f"    • QCO Title: {bundle_b['qco_details']['order_title']}")
    assert any("335" in m for m in raw_mats_b), "IS 335 (Insulating oil) must be linked to IS 1180"
    assert any("2026" in t for t in tests_b), "IS 2026 (Power transformer test) must be linked"
    print("    --> PASS: Case B normative bundle and QCO linkages verified.")

    # 4. Golden Case C: Structural Rebars (IS 1786:2008)
    print(f"\n[4] Testing Golden Case C: TMT Rebars (IS 1786:2008)")
    bundle_c = kg.get_normative_bundle("IS 1786:2008")
    assert bundle_c["status"] == "CURRENT", "IS 1786 must be CURRENT"
    assert bundle_c["is_qco_mandatory"] is True, "QCO must be mandatory for steel rebars"
    raw_mats_c = [m["code"] for m in bundle_c["raw_materials"]]
    tests_c = [t["code"] for t in bundle_c["testing_methods"]]
    print(f"    • Raw Materials: {raw_mats_c}")
    print(f"    • Testing Standards: {tests_c}")
    assert any("2830" in m for m in raw_mats_c), "IS 2830 (Steel billets) must be linked"
    assert any("1608" in t for t in tests_c), "IS 1608 (Tensile testing) must be linked"
    print("    --> PASS: Case C normative bundle and QCO linkages verified.")

    # 5. Testing Superseded Standards Detection
    print(f"\n[5] Testing Superseded Standards Detection:")
    superseded_checks = [
        ("IS 4984:1995", "IS 4984:2016"),
        ("IS 1180:1989", "IS 1180 (Part 1):2014"),
        ("IS 1786:1985", "IS 1786:2008"),
        ("IS 456:1978", "IS 456:2000")
    ]
    for old_std, expected_new in superseded_checks:
        info = kg.get_superseded_info(old_std)
        assert info is not None, f"Expected {old_std} to be detected as superseded"
        assert expected_new in info["current_standard"], f"Expected replacement {expected_new}, got {info['current_standard']}"
        print(f"    • {old_std} -> SUPERSEDED! Replacement: {info['current_standard']} ({info['edition']})")
    print("    --> PASS: Obsolete standards correctly detected and mapped to active editions.")

    # 6. Testing Foreign Standards Mapping & GFR 144(vii)
    print(f"\n[6] Testing Foreign Standards Conversion (GFR 144(vii)):")
    foreign_checks = [
        ("ASTM D3035", "IS 4984:2016"),
        ("ASTM A615", "IS 1786:2008"),
        ("DIN 8074", "IS 4984:2016"),
        ("BS 1387", "IS 1239 (Part 1):2004"),
        ("IEC 60076", "IS 1180 (Part 1):2014")
    ]
    for f_code, expected_is in foreign_checks:
        conv = kg.get_foreign_equivalent(f_code)
        assert conv is not None, f"Expected conversion for {f_code}"
        assert expected_is in conv["equivalent_is_code"], f"Expected {expected_is}, got {conv['equivalent_is_code']}"
        print(f"    • {f_code} -> Equivalent: {conv['equivalent_is_code']} ({conv['equivalence_level']})")
        assert "144(vii)" in conv["gfr_citation"], "GFR citation must mention Rule 144(vii)"
    print("    --> PASS: Foreign standards correctly converted with GFR citations.")

    # 7. Testing Subgraph Export for UI Visualizer
    print(f"\n[7] Testing Subgraph Export for React Flow / Cytoscape:")
    subgraph = kg.export_subgraph_for_ui("IS 4984:2016")
    print(f"    • Subgraph Nodes: {len(subgraph['nodes'])}")
    print(f"    • Subgraph Edges: {len(subgraph['edges'])}")
    node_types = [n["type"] for n in subgraph["nodes"]]
    print(f"    • Node Types Present: {set(node_types)}")
    assert "Primary_Standard" in node_types, "Primary node must exist"
    assert "Testing_Standard" in node_types, "Testing node must exist"
    assert "Material_Standard" in node_types, "Material node must exist"
    assert len(subgraph["edges"]) >= 3, "Edges must connect testing and materials"
    print("    --> PASS: Subgraph formatted and ready for UI canvas.")

    # 8. CVC Rules Pattern Integrity Check
    print(f"\n[8] Testing CVC Anti-Tailoring Rules Integrity:")
    cvc_path = backend_dir / "app" / "data" / "cvc_rules.json"
    with open(cvc_path, "r", encoding="utf-8") as f:
        cvc_data = json.load(f)
    rules = cvc_data.get("rules", [])
    assert len(rules) >= 4, "Must have at least 4 CVC rules"
    brand_rule = next(r for r in rules if r["rule_id"] == "CVC-01-BRAND-SPEC")
    brand_pattern = re.compile(brand_rule["pattern"], re.IGNORECASE)
    
    test_brands = ["Havells cables", "Tata Tiscon rebars", "Kirloskar pump", "Supreme pipes", "Finolex wire"]
    for sample in test_brands:
        match = brand_pattern.search(sample)
        assert match is not None, f"Brand pattern failed to detect brand in: '{sample}'"
        print(f"    • Brand detected in '{sample}': '{match.group(0)}'")
    print("    --> PASS: CVC brand and anti-tailoring patterns verified.")

    print("\n" + "="*70)
    print("ALL PHASE 1 TESTS PASSED WITH ZERO ERRORS!")
    print("="*70 + "\n")

if __name__ == "__main__":
    test_phase_1()
