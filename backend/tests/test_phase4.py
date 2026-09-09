"""
Automated Verification Suite for Phase 4:
CVC Anti-Tailoring, Foreign Standard Converter & Jinja2 Clause Synthesizer
Run via: python tests/test_phase4.py
"""
import sys
from pathlib import Path

# Ensure backend directory is in path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.foreign_converter import ForeignConverter
from app.services.cvc_linter import CVCLinter
from app.services.clause_generator import ClauseGenerator


def test_phase_4():
    print("\n" + "="*70)
    print("RUNNING PHASE 4 AUTOMATED VERIFICATION SUITE")
    print("="*70)

    # -------------------------------------------------------------------------
    # TEST 1: Foreign Standard Converter (GFR 2017 Rule 144(vii))
    # -------------------------------------------------------------------------
    print("\n[1] Testing Foreign Standard Converter (GFR 144(vii)):")
    converter = ForeignConverter()

    # 1A. Detection
    sample_text = "Supply of HDPE pipes per ASTM D3035, TMT bars per ASTM A615, and transformer per IEC 60076."
    detected = converter.detect_foreign_standards(sample_text)
    print(f"    • Detected foreign codes: {detected}")
    assert any("ASTM D3035" in d for d in detected), "Must detect ASTM D3035"
    assert any("ASTM A615" in d for d in detected), "Must detect ASTM A615"
    assert any("IEC 60076" in d for d in detected), "Must detect IEC 60076"

    # 1B. Single Code Conversions
    conv_pipe = converter.convert_code("ASTM D3035")
    print(f"    • ASTM D3035 -> {conv_pipe['equivalent_is_code']} ({conv_pipe['equivalence_level']})")
    assert conv_pipe["equivalent_is_code"] == "IS 4984:2016"
    assert "GFR 2017 Rule 144(vii)" in conv_pipe["gfr_citation"]

    conv_steel = converter.convert_code("ASTM A615")
    print(f"    • ASTM A615  -> {conv_steel['equivalent_is_code']} ({conv_steel['equivalence_level']})")
    assert conv_steel["equivalent_is_code"] == "IS 1786:2008"

    conv_iec = converter.convert_code("IEC 60076")
    print(f"    • IEC 60076  -> {conv_iec['equivalent_is_code']} ({conv_iec['equivalence_level']})")
    assert "IS 1180" in conv_iec["equivalent_is_code"]

    # 1C. Text Substitution
    replaced_text = converter.replace_foreign_standards("High quality pipes as per ASTM D3035 for water network.")
    print(f"    • Substituted text: {replaced_text}")
    assert "IS 4984:2016" in replaced_text
    assert "ASTM D3035" not in replaced_text
    assert "GFR 144(vii)" in replaced_text
    print("    --> PASS: Foreign standard conversion and GFR citations verified.")

    # -------------------------------------------------------------------------
    # TEST 2: CVC Anti-Tailoring & Linter Engine
    # -------------------------------------------------------------------------
    print("\n[2] Testing CVC Anti-Tailoring & Linter Engine:")
    linter = CVCLinter(foreign_converter=converter)

    # 2A. Proprietary Brand Detection
    brand_text = "Procurement of Havells or Finolex cables and Supreme plumbing pipes."
    brands = linter.extract_brands(brand_text)
    print(f"    • Extracted brands: {brands}")
    assert "Havells" in brands
    assert "Finolex" in brands
    assert "Supreme" in brands

    violations = linter.scan(brand_text)
    print(f"    • Brand violations found: {len(violations)}")
    assert any(v["rule_id"] == "CVC-01-BRAND-SPEC" for v in violations)
    assert any(v["severity"] == "CRITICAL" for v in violations)

    # 2B. Obsolete Standards & Foreign Standards
    messy_spec = (
        "Item: Distribution Transformer 500kVA as per obsolete IS 1180:1989.\n"
        "Pipes must strictly conform to ASTM D3035.\n"
        "Turnover should be minimum Rs. 600 Crores.\n"
        "Self-declaration acceptable for steel without BIS license."
    )
    audit_res = linter.audit_text(messy_spec)
    print(f"    • Messy Spec CVC Audit:")
    print(f"      - Score: {audit_res['cvc_compliance_score']}/100")
    print(f"      - Compliant: {audit_res['is_cvc_compliant']}")
    print(f"      - Rating: {audit_res['rating']}")
    print(f"      - Total Violations: {audit_res['total_violations']}")
    print(f"      - Severity Breakdown: {audit_res['severity_counts']}")

    assert audit_res["cvc_compliance_score"] < 50.0, "Messy spec score must be heavily penalized"
    assert audit_res["is_cvc_compliant"] is False
    assert audit_res["severity_counts"]["CRITICAL"] >= 1
    assert any(v["rule_id"] == "CVC-02-OBSOLETE-STD" for v in audit_res["violations"])
    assert any(v["rule_id"] == "CVC-03-UNJUSTIFIED-FOREIGN-STD" for v in audit_res["violations"])
    assert any(v["rule_id"] == "CVC-04-RESTRICTIVE-EXPERIENCE" for v in audit_res["violations"])
    assert any(v["rule_id"] == "CVC-05-MANDATORY-QCO-VIOLATION" for v in audit_res["violations"])

    # 2C. Sanitization Test
    sanitized = linter.sanitize_text("Procurement of 50 MT Tata Tiscon Fe500D rebars as per ASTM A615.")
    print(f"    • Sanitized text: {sanitized}")
    assert "Tata Tiscon" not in sanitized, "Brand must be stripped"
    assert "IS 1786:2008" in sanitized, "Foreign standard must be converted to IS"
    print("    --> PASS: CVC anti-tailoring scanner and sanitization verified.")

    # -------------------------------------------------------------------------
    # TEST 3: Jinja2 Tender Clause Synthesizer
    # -------------------------------------------------------------------------
    print("\n[3] Testing Jinja2 Tender Clause Synthesizer:")
    clause_gen = ClauseGenerator(cvc_linter=linter, foreign_converter=converter)

    # 3A. HDPE Pipes Clause (Mandatory QCO Scheme-I)
    pipe_clause = clause_gen.generate_clause(
        item_category="HDPE Drinking Water Pipes",
        standard_code="IS 4984:2016",
        include_cvc_safeguards=True,
        include_qco_mandate=True
    )
    clause_text = pipe_clause["synthesized_clause_text"]
    print(f"    • Synthesized Clause Length: {len(clause_text)} characters")
    print(f"    • Clause Title: {pipe_clause['clause_title']}")
    print(f"    • Referenced Regulations: {pipe_clause['referenced_regulations']}")

    assert "IS 4984:2016" in clause_text
    assert "Section 16" in clause_text
    assert "Section 29" in clause_text
    assert "Scheme-I (ISI Mark)" in clause_text
    assert "Amendment No. 1" in clause_text
    assert "IS 12235" in clause_text
    assert "NABL" in clause_text
    assert "CVC" in clause_text
    assert "GFR 2017 Rule 144" in clause_text
    # Ensure zero unresolved placeholders
    assert "[Insert" not in clause_text
    assert "TODO" not in clause_text
    assert "<fill" not in clause_text

    # 3B. IT Goods Clause (Scheme-II CRS)
    it_clause = clause_gen.generate_clause(
        item_category="Laptops & Notebook Computers",
        standard_code="IS 13252 (Part 1):2010"
    )
    it_text = it_clause["synthesized_clause_text"]
    assert "IS 13252 (Part 1):2010" in it_text
    assert "CRS" in it_text or "Scheme-II" in it_text
    print("    --> PASS: Jinja2 NIT clause generation verified with statutory grounding.")

    # -------------------------------------------------------------------------
    # TEST 4: Side-by-Side Harmonized Diff Generator
    # -------------------------------------------------------------------------
    print("\n[4] Testing Side-by-Side Harmonized Diff Generator:")
    dirty_tender = (
        "Supply of 1000m 110mm Supreme HDPE pipes conforming to ASTM D3035 "
        "and obsolete IS 4984:1995 for municipal water supply line."
    )
    diff_res = clause_gen.generate_harmonized_diff(dirty_tender, item_category="Municipal Water Pipeline")

    print(f"    • Removed Brands: {diff_res['removed_brands']}")
    print(f"    • Converted Foreign Standards: {[c['foreign_standard'] for c in diff_res['converted_foreign_standards']]}")
    print(f"    • Upgraded Standards: {[u['original'] + ' -> ' + u['recommended'] for u in diff_res['upgraded_obsolete_standards']]}")
    print(f"    • Injected Statutory Clauses: {len(diff_res['statutory_clauses_injected'])}")
    print(f"    • Diff Summary:")
    for d in diff_res["diff_summary"]:
        print(f"      - {d}")

    assert "Supreme" in diff_res["removed_brands"]
    assert any(c["foreign_standard"] == "ASTM D3035" for c in diff_res["converted_foreign_standards"])
    assert any(u["original"] == "IS 4984:1995" for u in diff_res["upgraded_obsolete_standards"])
    assert diff_res["target_standard"] == "IS 4984:2016"
    assert "IS 4984:2016" in diff_res["harmonized_text"]
    assert "Supreme" not in diff_res["harmonized_text"]
    assert len(diff_res["checklist"]) >= 3
    print("    --> PASS: Side-by-side diff generation verified.")

    print("\n" + "="*70)
    print("ALL PHASE 4 TESTS PASSED WITH ZERO ERRORS!")
    print("="*70 + "\n")


if __name__ == "__main__":
    test_phase_4()
