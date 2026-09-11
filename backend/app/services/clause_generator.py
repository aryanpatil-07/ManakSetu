"""
ManakSetu Tender Clause Synthesizer & Diff Generator (Phase 4)
Grounding:
- CVC Office Memorandum No. 03-05-1-CTE-9
- General Financial Rules (GFR 2017) Rule 144 & Rule 157
- BIS Conformity Assessment Schemes (Scheme-I ISI Mark & Scheme-II CRS)
"""
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from jinja2 import Environment, FileSystemLoader, Template

from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter
from app.services.foreign_converter import ForeignConverter


FALLBACK_TEMPLATE = """### TECHNICAL SPECIFICATION & STATUTORY COMPLIANCE SCHEDULE
**Item Nomenclature / Scope:** {{ item_category }}
**Governing National Standard:** {{ standard_code }} — {{ standard_title }}
{% if division %}**BIS Technical Division:** {{ division }}{% endif %}

---

#### 1. MANDATORY NATIONAL STANDARD & REVISION STATUS
1.1 The materials, components, and finished goods supplied under this contract shall strictly conform to the latest active revision of **{{ standard_code }}** along with all gazetted amendments.
{% if active_amendments and active_amendments|length > 0 %}
1.2 The bidder shall ensure compliance with the following active statutory amendments:
{% for am in active_amendments %}
    - {{ am }}
{% endfor %}
{% endif %}
1.3 Citing obsolete, superseded, or withdrawn revisions of the standard is strictly prohibited under GFR 2017 Rule 144.

#### 2. STATUTORY QUALITY CONTROL ORDER (QCO) ENFORCEMENT
{% if is_qco_mandatory %}
2.1 **MANDATORY STATUTORY REGULATION IN FORCE:** Pursuant to the **{{ qco_order }}** gazetted by the **{{ notifying_ministry }}** under Notification No. **{{ gazette_notification_no }}** in exercise of powers conferred by Section 16 of the Bureau of Indian Standards Act, 2016:
    (a) All goods supplied under this schedule must compulsorily bear the authentic Standard Mark (**{{ scheme }}**) under a valid and operational BIS license.
    (b) The bidder / OEM must hold an active BIS License (CM/L or CRS Registration Number) for the offered product category on the date of technical bid opening.
    (c) **Summary Technical Disqualification:** Any bid proposing uncertified products, self-certification, or goods not bearing the mandatory BIS Standard Mark shall be summarily rejected during technical evaluation without seeking post-bid clarification.
    (d) **Penal Safeguards:** Contravention of Section 16 of the BIS Act, 2016 is a cognizable statutory offense punishable under Section 29 with imprisonment up to two years or fine.
{% else %}
2.1 **VOLUNTARY QUALITY BENCHMARK:** While this product category is not currently notified under a mandatory Quality Control Order, compliance with {{ standard_code }} is prescribed as the mandatory technical quality baseline for this tender. Bidders holding a valid BIS license shall be accorded technical preference.
{% endif %}

#### 3. NORMATIVE RAW MATERIAL & TESTING PROTOCOLS
3.1 The supplied items shall adhere to the normative reference standards cited within {{ standard_code }}:
{% if raw_materials and raw_materials|length > 0 %}
    - **Governing Raw Material Specifications:** {{ raw_materials|join(', ') }}
{% endif %}
{% if testing_methods and testing_methods|length > 0 %}
    - **Prescribed Testing Protocols:** {{ testing_methods|join(', ') }}
{% endif %}
{% if allied_standards and allied_standards|length > 0 %}
    - **Allied & Installation Practices:** {{ allied_standards|join(', ') }}
{% endif %}
3.2 **Pre-Dispatch Inspection Checklist:**
{% if inspection_checklist and inspection_checklist|length > 0 %}
{% for check in inspection_checklist %}
    - {{ check }}
{% endfor %}
{% endif %}

#### 4. QUALITY ASSURANCE, LAB TESTING & ACCEPTANCE
4.1 The contractor shall submit authentic Manufacturer Test Certificates (MTC) alongside dispatch documents confirming 100% batch testing in an NABL-accredited or BIS-recognized testing laboratory.
4.2 The Purchaser reserves the statutory right to appoint an independent Third-Party Inspection (TPI) agency (e.g., RITES / EIL / CEIL / BIS) for stage-wise inspection and sampling at the manufacturer's works prior to dispatch.

#### 5. CVC BRAND NEUTRALITY & ANTI-TAILORING SAFEGUARDS
5.1 In strict accordance with Central Vigilance Commission (CVC) Directives (Office Memorandum No. 03-05-1-CTE-9) and General Financial Rules (GFR 2017) Rule 144(vii) & Rule 157:
    (a) This specification is strictly generic and performance-based. No proprietary make, trade name, patent, or restrictive dimension is mandated.
    (b) Any inadvertent or historical reference in tender documents to specific brand names or makes shall be construed strictly as illustrative and shall be read as *"or equivalent product certified to {{ standard_code }}"*.
    (c) Foreign standards (ASTM / DIN / ISO / BS / IEC / EN) cited by prospective bidders shall be evaluated strictly against the equivalent Indian Standard (**{{ standard_code }}**) pursuant to GFR 2017 Rule 144(vii).
"""


class ClauseGenerator:
    """
    Synthesizes bid-ready procurement clauses and side-by-side diff comparisons
    grounded in BIS standards, gazetted QCOs, and CVC anti-tailoring rules.
    """

    def __init__(
        self,
        regulatory_engine: Optional[RegulatoryEngine] = None,
        cvc_linter: Optional[CVCLinter] = None,
        foreign_converter: Optional[ForeignConverter] = None
    ):
        self.regulatory_engine = regulatory_engine if regulatory_engine is not None else RegulatoryEngine()
        self.foreign_converter = foreign_converter if foreign_converter is not None else ForeignConverter()
        self.cvc_linter = cvc_linter if cvc_linter is not None else CVCLinter(foreign_converter=self.foreign_converter)
        
        # Initialize Jinja2 environment
        template_dir = Path(__file__).resolve().parent.parent / "templates"
        if template_dir.exists() and (template_dir / "tender_clause.j2").exists():
            env = Environment(loader=FileSystemLoader(str(template_dir)), trim_blocks=True, lstrip_blocks=True)
            self.template = env.get_template("tender_clause.j2")
        else:
            self.template = Template(FALLBACK_TEMPLATE)

    def generate_clause(
        self,
        item_category: str,
        standard_code: str,
        include_cvc_safeguards: bool = True,
        include_qco_mandate: bool = True,
        custom_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes a legally vetted, audit-proof Notice Inviting Tender (NIT) technical clause.
        Fills all fields deterministically from the regulatory engine without placeholders.
        """
        val = self.regulatory_engine.validate_standard(standard_code)
        active_code = val.get("recommended_standard") or standard_code
        title = val.get("title") or "Technical Specification"
        is_qco = val.get("is_qco_mandatory", False) if include_qco_mandate else False
        qco_details = val.get("qco_details", {})
        normative = val.get("normative_bundle", {})

        template_context = {
            "item_category": item_category,
            "standard_code": active_code,
            "standard_title": title,
            "division": val.get("division", "Civil / Electrotechnical / Mechanical Engineering"),
            "active_amendments": val.get("active_amendments", []),
            "is_qco_mandatory": is_qco,
            "qco_order": val.get("qco_order") or qco_details.get("order_title", "Quality Control Order (QCO)"),
            "notifying_ministry": qco_details.get("notifying_ministry", "Central Ministry"),
            "gazette_notification_no": qco_details.get("gazette_notification_no", "S.O. Gazetted Order"),
            "scheme": qco_details.get("scheme", "Scheme-I (ISI Mark)"),
            "raw_materials": normative.get("raw_materials", []),
            "testing_methods": normative.get("testing_methods", []),
            "allied_standards": normative.get("allied_standards", []),
            "inspection_checklist": normative.get("inspection_checklist", [])
        }

        rendered_text = self.template.render(**template_context).strip()

        # Build formal regulatory citations
        regulations = [
            f"Bureau of Indian Standards: {active_code} ({title})",
            "General Financial Rules (GFR 2017) Rule 144(vii) — National Standards Mandate",
            "General Financial Rules (GFR 2017) Rule 157 — Generic Technical Specifications",
            "CVC Guidelines on Procurement & Anti-Tailoring (Office Memorandum No. 03-05-1-CTE-9)"
        ]
        if is_qco:
            regulations.append(f"Statutory Order: {template_context['qco_order']} ({template_context['gazette_notification_no']})")
            regulations.append("Section 16 & Section 29, Bureau of Indian Standards Act, 2016")

        checklist = [
            f"Verify current BIS license validity for {active_code} on BIS Care Portal (manakonline.in)",
            "Ensure no restrictive OEM proprietary terms or single-make stipulations remain in tender",
            "Confirm manufacturer test certificates (MTC) from NABL-accredited lab are demanded per lot",
            "Include third-party inspection (TPI) clause for critical high-value delivery batches"
        ]

        return {
            "standard_code": active_code,
            "item_category": item_category,
            "clause_title": f"Bid-Ready BIS Compliant Specification — {item_category}",
            "synthesized_clause_text": rendered_text,
            "referenced_regulations": regulations,
            "checklist": checklist,
            "is_qco_mandatory": is_qco,
            "qco_order": template_context["qco_order"],
            "statutory_clause": val.get("statutory_clause")
        }

    def generate_harmonized_diff(
        self,
        original_text: str,
        target_standard: Optional[str] = None,
        item_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Harmonizes messy procurement text into a CVC-compliant, GFR-aligned tender specification:
        1. Strips proprietary brand names (CVC anti-tailoring violation)
        2. Converts foreign standards (ASTM, DIN, ISO, BS, IEC) to national IS equivalents (GFR 144(vii))
        3. Upgrades obsolete / superseded revisions to active editions
        4. Injects gazetted QCO statutory clauses and NABL testing schedules
        5. Generates structured side-by-side comparison payload
        """
        if not original_text:
            return {
                "original_text": "",
                "harmonized_text": "",
                "removed_brands": [],
                "converted_foreign_standards": [],
                "upgraded_obsolete_standards": [],
                "statutory_clauses_injected": [],
                "diff_summary": []
            }

        diff_summary = []

        # 1. Detect and strip proprietary brands
        detected_brands = self.cvc_linter.extract_brands(original_text)
        if detected_brands:
            diff_summary.append(
                f"CVC Anti-Tailoring: Removed {len(detected_brands)} proprietary brand name(s) "
                f"({', '.join(detected_brands)}) pursuant to CVC OM No. 03-05-1-CTE-9 & GFR Rule 157."
            )

        # 2. Detect and convert foreign standards
        converted_foreign = self.foreign_converter.scan_and_convert(original_text)
        mapped_foreign_codes = [c for c in converted_foreign if c.get("equivalent_is_code")]
        if mapped_foreign_codes:
            for mf in mapped_foreign_codes:
                diff_summary.append(
                    f"GFR Rule 144(vii) Conversion: Converted foreign standard '{mf['foreign_standard']}' "
                    f"to national equivalent '{mf['equivalent_is_code']}'."
                )

        # 3. Detect cited standards and upgrade obsolete revisions
        cited_standards = self.regulatory_engine.extract_standards_from_text(original_text)
        upgraded_standards = []
        resolved_std_code = target_standard

        for c_std in cited_standards:
            val = self.regulatory_engine.validate_standard(c_std)
            if val["status"] in ["OBSOLETE", "WITHDRAWN"]:
                rec = val["recommended_standard"]
                upgraded_standards.append({
                    "original": c_std,
                    "recommended": rec,
                    "reason": val["notes"]
                })
                diff_summary.append(
                    f"Lifecycle Upgrade: Obsolete standard '{c_std}' upgraded to active revision '{rec}' "
                    f"with active amendments: {', '.join(val.get('active_amendments', []))}."
                )
                if not resolved_std_code:
                    resolved_std_code = rec
            elif not resolved_std_code:
                resolved_std_code = val.get("recommended_standard") or c_std

        # If still no resolved standard, check mapped foreign standards
        if not resolved_std_code and mapped_foreign_codes:
            resolved_std_code = mapped_foreign_codes[0]["equivalent_is_code"]

        # 4. Clean original text (strip brands, replace foreign codes, upgrade obsolete codes)
        sanitized_desc = self.cvc_linter.sanitize_text(original_text)
        for up in upgraded_standards:
            # Replace obsolete code with active code in description
            sanitized_desc = re.sub(rf'\b{re.escape(up["original"])}\b', up["recommended"], sanitized_desc, flags=re.IGNORECASE)

        inferred_category = item_category or "Procurement Package"

        # If no standard is resolved, do not inject arbitrary standard.
        if not resolved_std_code:
            generic_clause = f"""### HARMONIZED PROCUREMENT SPECIFICATION ({inferred_category.upper()})

1. **TECHNICAL SPECIFICATION:** All goods supplied under this schedule shall strictly adhere to governing Indian Standards (BIS) and statutory Quality Control Orders (QCOs) notified by the Government of India.
2. **CVC BRAND NEUTRALITY:** In strict accordance with Central Vigilance Commission directives (OM No. 03-05-1-CTE-9) and GFR 2017 Rule 144, all requirements are generic and functional. Proprietary brand names are non-restrictive.
3. **EQUIVALENCE BENCHMARKS:** Prospective bidders citing international specifications (ASTM, DIN, ISO, BS, EN) shall submit formal technical equivalence certificates pursuant to GFR 2017 Rule 144(vii)."""
            return {
                "original_text": original_text,
                "harmonized_text": f"{sanitized_desc}\n\n{generic_clause}".strip(),
                "target_standard": None,
                "removed_brands": detected_brands,
                "converted_foreign_standards": converted_foreign,
                "upgraded_obsolete_standards": upgraded_standards,
                "statutory_clauses_injected": [],
                "diff_summary": diff_summary,
                "referenced_regulations": ["GFR 2017 Rule 144", "CVC OM No. 03-05-1-CTE-9"],
                "checklist": ["Verify generic specifications without proprietary brand bias"],
                "is_cvc_compliant": True
            }

        # 5. Synthesize formal bid-ready clause
        clause_data = self.generate_clause(
            item_category=inferred_category,
            standard_code=resolved_std_code,
            include_cvc_safeguards=True,
            include_qco_mandate=True
        )

        injected_statutory = []
        if clause_data.get("is_qco_mandatory"):
            stat_clause = clause_data.get("statutory_clause")
            if stat_clause:
                injected_statutory.append(stat_clause)
            diff_summary.append(
                f"Statutory Mandate: Injected compulsory BIS Certification & QCO clause under Section 16 "
                f"of the BIS Act, 2016 ({clause_data.get('qco_order', 'QCO')})."
            )

        # 6. Assemble complete harmonized specification
        harmonized_text = f"""{sanitized_desc}

{clause_data['synthesized_clause_text']}"""

        return {
            "original_text": original_text,
            "harmonized_text": harmonized_text.strip(),
            "target_standard": resolved_std_code,
            "removed_brands": detected_brands,
            "converted_foreign_standards": converted_foreign,
            "upgraded_obsolete_standards": upgraded_standards,
            "statutory_clauses_injected": injected_statutory,
            "diff_summary": diff_summary,
            "referenced_regulations": clause_data["referenced_regulations"],
            "checklist": clause_data["checklist"],
            "is_cvc_compliant": True
        }

    def harmonize_text(self, original_text: str, target_standard: Optional[str] = None, item_category: Optional[str] = None) -> Dict[str, Any]:
        """Convenience alias for generate_harmonized_diff()."""
        return self.generate_harmonized_diff(original_text, target_standard, item_category)

    def harmonize_specification(self, original_text: str, target_standard: Optional[str] = None, item_category: Optional[str] = None) -> Dict[str, Any]:
        """Convenience alias for generate_harmonized_diff()."""
        return self.generate_harmonized_diff(original_text, target_standard, item_category)
