from jinja2 import Template
from typing import Dict, Any, List
from app.services.regulatory_engine import RegulatoryEngine

CLAUSE_TEMPLATE = """
### SECTION 4.2 - TECHNICAL SPECIFICATIONS & REGULATORY COMPLIANCE CLAUSE
**Item Category:** {{ item_category }}
**Applicable Indian Standard:** {{ standard_code }} ({{ standard_title }})

1. **Mandatory National Standard & Quality Certification:**
   The materials/goods supplied under this contract shall strictly conform to the latest revision and amendments of **{{ standard_code }}**. 
   {% if is_qco_mandatory %}
   Pursuant to the **{{ qco_order }}** issued by the competent Ministry under the Bureau of Indian Standards Act, 2016:
   - The product must bear the valid Standard Mark (**ISI Mark**).
   - The manufacturer/bidder must possess a valid BIS license for the specified scope as on the date of tender submission.
   - Bids offering non-BIS certified goods or goods without the ISI Mark shall be summarily rejected without technical evaluation.
   {% endif %}

2. **CVC Anti-Tailoring & Brand Neutrality Safeguards:**
   - In adherence with Central Vigilance Commission (CVC) Circulars and GFR 2017 Rule 144, no proprietary brand names, single-make stipulations, or exclusionary parameters are prescribed.
   - Any reference to trade names or proprietary equipment in tender documents shall be interpreted as illustrative and strictly construed to mean *"or equivalent product certified to {{ standard_code }}"*.

3. **Inspection, Testing & Acceptance Protocols:**
   - The contractor shall furnish manufacturer's test certificates (MTC) from an NABL-accredited / BIS-approved laboratory for every lot delivered.
   - Third-Party Inspection (TPI) by an authorized agency (e.g. RITES / EIL / CEIL / BIS) may be conducted at manufacturer's premises prior to dispatch.
   - On-site random sampling and independent batch testing shall be executed in accordance with sampling procedures specified in {{ standard_code }}.
"""

class ClauseGenerator:
    """
    Synthesizes bid-ready procurement clauses using Jinja2 templates
    and BIS compliance datasets.
    """
    def __init__(self):
        self.regulatory_engine = RegulatoryEngine()
        self.template = Template(CLAUSE_TEMPLATE)

    def generate_clause(
        self,
        item_category: str,
        standard_code: str,
        include_cvc_safeguards: bool = True,
        include_qco_mandate: bool = True,
        custom_params: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        val = self.regulatory_engine.validate_standard(standard_code)
        active_code = val.get("recommended_standard") or standard_code
        title = val.get("title") or "Technical Specification"
        is_qco = val.get("is_qco_mandatory", False) if include_qco_mandate else False
        qco_order = val.get("qco_order") or "Quality Control Order (QCO)"

        rendered_text = self.template.render(
            item_category=item_category,
            standard_code=active_code,
            standard_title=title,
            is_qco_mandatory=is_qco,
            qco_order=qco_order
        ).strip()

        regulations = [
            f"Bureau of Indian Standards ({active_code})",
            "General Financial Rules (GFR 2017) Rule 144",
            "CVC Guidelines on Procurement & Anti-Tailoring (OM No. 03-05-1-CTE-9)"
        ]
        if is_qco:
            regulations.append(f"Statutory Gazette: {qco_order}")

        checklist = [
            f"Verify current BIS license validity for {active_code} on BIS care portal (manakonline.in)",
            "Ensure no restrictive OEM proprietary terms are left uncorrected",
            "Confirm manufacturer test certificates (MTC) are demanded per delivery batch",
            "Include third-party inspection (TPI) clause for critical high-value lots"
        ]

        return {
            "standard_code": active_code,
            "item_category": item_category,
            "clause_title": f"Bid-Ready BIS Compliant Clause - {item_category}",
            "synthesized_clause_text": rendered_text,
            "referenced_regulations": regulations,
            "checklist": checklist
        }
