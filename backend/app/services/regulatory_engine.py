"""
ManakSetu Regulatory, QCO & Standard Lifecycle Engine (Phase 3)
Grounding:
- BIS Act 2016 (Section 16: Mandatory Standards & Section 29: Penal Provisions)
- DPIIT, Ministry of Steel, MeitY, MoHUA Gazette Quality Control Orders (QCOs)
- GFR 2017 Rule 144(vii) & CVC Anti-Tailoring Directives
"""
import json
import re
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.core.config import settings
from app.services.knowledge_graph import StandardsKnowledgeGraph


class RegulatoryEngine:
    """
    Deterministic validation engine for:
    1. BIS Standard Lifecycle Verification (CURRENT vs SUPERSEDED vs WITHDRAWN vs UNSPECIFIED)
    2. Gazetted Quality Control Order (QCO) Mandatory Enforcement (Scheme-I ISI Mark vs Scheme-II CRS)
    3. Normative Testing and Material Schedule Assembly
    4. Free-Text Procurement Specification Auditing & Risk Assessment
    """

    def __init__(self, kg: Optional[StandardsKnowledgeGraph] = None):
        self.standards_by_code: Dict[str, Dict[str, Any]] = {}
        self.standards_by_num: Dict[str, List[Dict[str, Any]]] = {}
        self.superseded_map: Dict[str, Dict[str, Any]] = {}
        self.withdrawn_standards: Dict[str, Dict[str, Any]] = {}
        self.qco_by_code: Dict[str, Dict[str, Any]] = {}
        self.qco_by_num: Dict[str, Dict[str, Any]] = {}
        self.all_qcos: List[Dict[str, Any]] = []
        
        # Knowledge Graph Integration
        self.kg = kg if kg is not None else StandardsKnowledgeGraph()
        
        self._load_datasets()

    def _load_datasets(self):
        """Loads and indexes standards and QCO masters into fast lookup structures."""
        # 1. Load Standards Master
        if settings.STANDARDS_MASTER_PATH.exists():
            with open(settings.STANDARDS_MASTER_PATH, "r", encoding="utf-8") as f:
                standards = json.load(f)
                for s in standards:
                    code_norm = self.normalize_standard_code(s["is_code"])
                    self.standards_by_code[code_norm] = s
                    
                    std_num = self.normalize_standard_code(s.get("standard_number", ""))
                    if std_num:
                        self.standards_by_num.setdefault(std_num, []).append(s)

                    # Index superseded standards (specific historical revisions)
                    for sup in s.get("supersedes", []):
                        sup_norm = self.normalize_standard_code(sup)
                        self.superseded_map[sup_norm] = s

                    # Index withdrawn standards
                    if s.get("status") == "WITHDRAWN":
                        self.withdrawn_standards[code_norm] = s
                        if std_num:
                            self.withdrawn_standards[std_num] = s

        # 2. Load QCO Master
        if settings.QCO_MASTER_PATH.exists():
            with open(settings.QCO_MASTER_PATH, "r", encoding="utf-8") as f:
                qcos = json.load(f)
                self.all_qcos = qcos
                for q in qcos:
                    for std in q.get("covered_is_codes", q.get("covered_standards", [])):
                        norm_std = self.normalize_standard_code(std)
                        self.qco_by_code[norm_std] = q
                        base = self._get_base_code(norm_std)
                        if base:
                            self.qco_by_num[base] = q

    def normalize_standard_code(self, raw: str) -> str:
        """
        Normalizes varied standard strings to canonical BIS format.
        Examples:
            'IS:4984:1995' -> 'IS 4984:1995'
            'IS4984-2016'  -> 'IS 4984:2016'
            'IS 4984 : 2016' -> 'IS 4984:2016'
            'IS 1180(Part 1):2014' -> 'IS 1180 (Part 1):2014'
        """
        if not raw:
            return ""
        s = raw.strip().upper()
        # Replace hyphens separating year with colon (e.g., IS 4984-2016 -> IS 4984:2016)
        s = re.sub(r'(\d+)\s*-\s*(\d{4})\b', r'\1:\2', s)
        # Fix colon spacing
        s = re.sub(r'\s*:\s*', ':', s)
        # Normalize IS prefix
        s = re.sub(r'^IS\s*:\s*', 'IS ', s)
        s = re.sub(r'^IS([0-9])', r'IS \1', s)
        # Ensure single space before parentheses
        s = re.sub(r'\s*\(\s*', ' (', s)
        s = re.sub(r'\s*\)\s*', ') ', s)
        # Clean colon after parentheses e.g. (Part 1) : 2014
        s = re.sub(r'\)\s*:\s*', '):', s)
        
        # Standardize Part and Sec casing inside parentheses
        def _clean_parens(match):
            inner = match.group(1)
            inner = re.sub(r'\bPART\b', 'Part', inner, flags=re.IGNORECASE)
            inner = re.sub(r'\bSEC\b', 'Sec', inner, flags=re.IGNORECASE)
            return f"({inner})"
        s = re.sub(r'\((.*?)\)', _clean_parens, s)
        return s

    def _get_base_code(self, code: str) -> str:
        """Strips revision year to yield base standard code (e.g. 'IS 4984:2016' -> 'IS 4984')."""
        return re.sub(r':\s*\d{4}\b', '', code).strip()

    def _extract_year(self, code: str) -> Optional[int]:
        """Extracts 4-digit revision year from standard code if present."""
        m = re.search(r':\s*(\d{4})\b', code)
        if m:
            try:
                return int(m.group(1))
            except ValueError:
                return None
        return None

    def extract_standards_from_text(self, text: str) -> List[str]:
        """
        Extracts all Indian Standard citations from natural language text.
        Handles complex patterns like:
        - 'IS 4984:1995'
        - 'IS 1180 (Part 1):2014'
        - 'IS:1786'
        - 'IS 2062-2011'
        - 'IS 10322 (Part 5/Sec 3):2012'
        """
        if not text:
            return []
        
        # Prioritize matching 4-digit revision year when present, while also capturing multipart standard citations
        pattern = r'\b(?:IS|BIS)\s*(?::\s*)?[0-9]+(?:\s*\([^\)]+\))?(?:\s*[:\-]\s*[0-9]{4}|(?!\s*[:\-]\s*[0-9]{4}))'
        matches = re.finditer(pattern, text, re.IGNORECASE)
        
        extracted = []
        for m in matches:
            norm = self.normalize_standard_code(m.group())
            if norm and norm not in extracted:
                extracted.append(norm)
        return extracted

    def check_lifecycle(self, raw_code: str) -> Dict[str, Any]:
        """
        Deterministic Lifecycle State Validator:
        Determines if standard is:
        - CURRENT: Active current revision validated
        - SUPERSEDED (OBSOLETE): Older revision replaced by newer standard
        - WITHDRAWN: Cancelled by BIS, illegal to specify
        - UNSPECIFIED_REVISION: Base code given without revision year
        - UNKNOWN: Not found in repository
        """
        norm_code = self.normalize_standard_code(raw_code)
        year = self._extract_year(norm_code)
        base_code = self._get_base_code(norm_code)

        # 1. Check WITHDRAWN standards
        if norm_code in self.withdrawn_standards or base_code in self.withdrawn_standards:
            w_std = self.withdrawn_standards.get(norm_code) or self.withdrawn_standards.get(base_code)
            replacement = w_std.get("replacement_standard", "IS 2062:2011")
            return {
                "specified": raw_code,
                "normalized_code": norm_code,
                "lifecycle_state": "WITHDRAWN",
                "status": "WITHDRAWN",
                "alert_level": "CRITICAL",
                "alert_badge": "RED ALERT: WITHDRAWN STANDARD",
                "is_current": False,
                "recommended_standard": replacement,
                "title": w_std.get("title", ""),
                "active_amendments": [],
                "superseded_by": replacement,
                "notes": (
                    f"CRITICAL REGULATORY VIOLATION: Standard '{raw_code}' was officially WITHDRAWN by BIS "
                    f"(withdrawn date: {w_std.get('withdrawn_date', 'N/A')}). It cannot be legally cited in public tenders. "
                    f"Use replacement standard '{replacement}'."
                )
            }

        # 2. Check direct CURRENT / ACTIVE match
        if norm_code in self.standards_by_code:
            std = self.standards_by_code[norm_code]
            if std.get("status") == "CURRENT":
                amendments = std.get("active_amendments", [])
                return {
                    "specified": raw_code,
                    "normalized_code": norm_code,
                    "lifecycle_state": "CURRENT",
                    "status": "ACTIVE",
                    "alert_level": "NONE",
                    "alert_badge": "STATUS: CURRENT VALIDATED",
                    "is_current": True,
                    "recommended_standard": std["is_code"],
                    "title": std.get("title", ""),
                    "active_amendments": amendments,
                    "superseded_by": None,
                    "notes": (
                        f"Active BIS revision validated ({std['is_code']}). "
                        f"Includes {len(amendments)} active amendment(s): {', '.join(amendments) if amendments else 'None'}."
                    )
                }

        # 3. Check if explicitly in SUPERSEDED map
        if norm_code in self.superseded_map:
            active_std = self.superseded_map[norm_code]
            amendments = active_std.get("active_amendments", [])
            return {
                "specified": raw_code,
                "normalized_code": norm_code,
                "lifecycle_state": "SUPERSEDED",
                "status": "OBSOLETE",
                "alert_level": "CRITICAL",
                "alert_badge": "RED ALERT: LIFECYCLE SUPERSEDED",
                "is_current": False,
                "recommended_standard": active_std["is_code"],
                "title": active_std.get("title", ""),
                "active_amendments": amendments,
                "superseded_by": active_std["is_code"],
                "notes": (
                    f"OBSOLETE STANDARD CITATION: Standard '{raw_code}' was superseded by '{active_std['is_code']}'. "
                    f"Citing obsolete standards restricts competitive bidding and violates CVC / GFR 2017 guidelines. "
                    f"Replace with '{active_std['is_code']}' and active amendments: {', '.join(amendments) if amendments else 'None'}."
                )
            }

        # 4. Check year comparison against known standards with same base code
        if base_code in self.standards_by_num:
            active_stds = self.standards_by_num[base_code]
            active_std = active_stds[0]
            current_year = active_std.get("year", 0)
            
            # If a year was cited and it is older than the current revision year
            if year and year < current_year:
                amendments = active_std.get("active_amendments", [])
                return {
                    "specified": raw_code,
                    "normalized_code": norm_code,
                    "lifecycle_state": "SUPERSEDED",
                    "status": "OBSOLETE",
                    "alert_level": "CRITICAL",
                    "alert_badge": "RED ALERT: LIFECYCLE SUPERSEDED",
                    "is_current": False,
                    "recommended_standard": active_std["is_code"],
                    "title": active_std.get("title", ""),
                    "active_amendments": amendments,
                    "superseded_by": active_std["is_code"],
                    "notes": (
                        f"OBSOLETE REVISION: Revision year {year} in '{raw_code}' is superseded by current revision "
                        f"'{active_std['is_code']}' (Year {current_year}). Must be updated to active standard."
                    )
                }

            # If no year was cited (e.g. 'IS 4984')
            if not year:
                amendments = active_std.get("active_amendments", [])
                return {
                    "specified": raw_code,
                    "normalized_code": norm_code,
                    "lifecycle_state": "UNSPECIFIED",
                    "status": "UNSPECIFIED_REVISION",
                    "alert_level": "WARNING",
                    "alert_badge": "AMBER ALERT: UNSPECIFIED REVISION YEAR",
                    "is_current": False,
                    "recommended_standard": active_std["is_code"],
                    "title": active_std.get("title", ""),
                    "active_amendments": amendments,
                    "superseded_by": None,
                    "notes": (
                        f"UNSPECIFIED REVISION YEAR: '{raw_code}' lacks a definitive publication year. "
                        f"Tender specifications should mandate the latest active revision '{active_std['is_code']}' "
                        f"with all active amendments."
                    )
                }

        # 5. Unknown standard
        return {
            "specified": raw_code,
            "normalized_code": norm_code,
            "lifecycle_state": "UNKNOWN",
            "status": "UNKNOWN",
            "alert_level": "INFO",
            "alert_badge": "STATUS: UNKNOWN STANDARD",
            "is_current": False,
            "recommended_standard": None,
            "title": None,
            "active_amendments": [],
            "superseded_by": None,
            "notes": f"Standard '{raw_code}' was not found in the verified BIS master catalog."
        }

    def check_qco_compliance(self, is_code_or_base: str) -> Dict[str, Any]:
        """
        Mandatory Quality Control Order (QCO) Compliance Engine:
        Queries gazetted QCO orders under Section 16 of the BIS Act, 2016.
        Returns statutory mandates, gazette numbers, notifying ministry, scheme, and legal clauses.
        """
        norm_code = self.normalize_standard_code(is_code_or_base)
        base_code = self._get_base_code(norm_code)

        qco = self.qco_by_code.get(norm_code) or self.qco_by_num.get(base_code)

        # Fallback: search through all QCOs
        if not qco:
            for q in self.all_qcos:
                covered = [self.normalize_standard_code(c) for c in q.get("covered_is_codes", q.get("covered_standards", []))]
                if norm_code in covered or base_code in [self._get_base_code(c) for c in covered]:
                    qco = q
                    break

        if qco:
            scheme = qco.get("scheme", "Scheme-I (ISI Mark)")
            statutory_clause = qco.get("statutory_clause")
            if not statutory_clause:
                statutory_clause = (
                    f"In terms of the {qco.get('order_title', 'Quality Control Order')} issued by the "
                    f"{qco.get('notifying_ministry', 'Central Government')} under Section 16 of the BIS Act, 2016, "
                    f"all items conforming to {base_code} must compulsorily bear the Standard Mark ({scheme}) "
                    f"under a valid BIS license. Any bid offering non-certified goods shall be summarily rejected."
                )

            return {
                "is_qco_mandatory": True,
                "compliance_type": "MANDATORY_STATUTORY",
                "qco_badge": "STATUTORY MANDATE: QUALITY CONTROL ORDER IN FORCE",
                "qco_id": qco.get("qco_id", qco.get("order_id")),
                "order_title": qco.get("order_title", "Quality Control Order"),
                "notifying_ministry": qco.get("notifying_ministry", qco.get("ministry", "Central Government")),
                "gazette_notification_no": qco.get("gazette_notification_no", ""),
                "notification_date": qco.get("notification_date", ""),
                "enforcement_date": qco.get("enforcement_date", qco.get("date_effective", "")),
                "scheme": scheme,
                "legal_provision": qco.get("legal_provision", "Section 16, BIS Act 2016"),
                "statutory_clause": statutory_clause,
                "penalty_clause": (
                    "Penal Clause: Section 29 of the BIS Act, 2016 prescribes imprisonment up to two years "
                    "or a fine not less than ₹2,00,000 for manufacturing, importing, selling, or procuring "
                    "non-certified goods in QCO notified categories."
                )
            }

        return {
            "is_qco_mandatory": False,
            "compliance_type": "VOLUNTARY",
            "qco_badge": "VOLUNTARY COMPLIANCE: Recommended for Quality Assurance",
            "qco_id": None,
            "order_title": None,
            "notifying_ministry": None,
            "gazette_notification_no": None,
            "notification_date": None,
            "enforcement_date": None,
            "scheme": "Voluntary",
            "legal_provision": None,
            "statutory_clause": None,
            "penalty_clause": None
        }

    def get_normative_testing_bundle(self, is_code: str) -> Dict[str, Any]:
        """
        Traverses knowledge graph to assemble mandatory raw material standards,
        testing protocols, and allied installation specifications.
        """
        norm_code = self.normalize_standard_code(is_code)
        
        # Use Knowledge Graph if standard is present in it
        if self.kg and norm_code in self.kg.standards_by_code:
            bundle = self.kg.get_normative_bundle(norm_code)
            raw_materials = [m["code"] for m in bundle.get("raw_materials", [])]
            testing_methods = [t["code"] for t in bundle.get("testing_methods", [])]
            allied = [a["code"] for a in bundle.get("allied_standards", [])]
        else:
            # Fallback to standards_master direct json
            std = self.standards_by_code.get(norm_code)
            if not std:
                base = self._get_base_code(norm_code)
                if base in self.standards_by_num:
                    std = self.standards_by_num[base][0]
            
            normative = std.get("normative_references", {}) if std else {}
            raw_materials = normative.get("raw_material", [])
            testing_methods = normative.get("testing_methods", [])
            allied = normative.get("allied_fittings", [])

        # Generate concrete inspection checklist
        inspection_checklist = []
        if testing_methods:
            for tm in testing_methods[:4]:
                inspection_checklist.append(f"Mandatory Factory / Acceptance Test per {tm}")
        inspection_checklist.append("Verification of BIS License (CM/L or CRS number) on BIS portal (manakonline.in)")
        inspection_checklist.append("Manufacturer Test Certificate (MTC) verification for each batch")

        return {
            "is_code": norm_code,
            "raw_materials": raw_materials,
            "testing_methods": testing_methods,
            "allied_standards": allied,
            "inspection_checklist": inspection_checklist
        }

    def validate_standard(self, raw_code: str) -> Dict[str, Any]:
        """
        Unified standard validator:
        Combines Lifecycle + QCO Order + Normative Bundle into a single comprehensive response.
        Backwards-compatible with all existing callers in boq_processor, clause_generator, and main.py.
        """
        lifecycle = self.check_lifecycle(raw_code)
        recommended = lifecycle.get("recommended_standard") or lifecycle.get("normalized_code") or raw_code
        qco_info = self.check_qco_compliance(recommended)
        normative = self.get_normative_testing_bundle(recommended)

        return {
            "specified": raw_code,
            "normalized_code": lifecycle.get("normalized_code"),
            "status": lifecycle["status"],                          # "ACTIVE" | "OBSOLETE" | "WITHDRAWN" | "UNSPECIFIED_REVISION" | "UNKNOWN"
            "lifecycle_state": lifecycle["lifecycle_state"],        # "CURRENT" | "SUPERSEDED" | "WITHDRAWN" | "UNSPECIFIED" | "UNKNOWN"
            "alert_level": lifecycle["alert_level"],
            "alert_badge": lifecycle["alert_badge"],
            "is_current": lifecycle["is_current"],
            "recommended_standard": recommended,
            "title": lifecycle.get("title"),
            "active_amendments": lifecycle.get("active_amendments", []),
            "superseded_by": lifecycle.get("superseded_by"),
            
            # QCO Fields
            "is_qco_mandatory": qco_info["is_qco_mandatory"],
            "qco_order": qco_info.get("order_title"),
            "qco_badge": qco_info["qco_badge"],
            "qco_details": qco_info,
            "statutory_clause": qco_info.get("statutory_clause"),
            "penalty_clause": qco_info.get("penalty_clause"),
            
            # Normative Testing Bundle
            "normative_bundle": normative,
            
            # Advisory / Notes
            "notes": lifecycle["notes"]
        }

    def evaluate_retrieval_candidate(self, candidate: Dict[str, Any], query_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Enhances Phase 2 retrieval candidate with full Phase 3 regulatory audit.
        """
        cand_code = candidate.get("is_code", "")
        val = self.validate_standard(cand_code)

        # Check if query cited an obsolete standard that maps to this candidate
        cited_superseded = []
        if query_text:
            cited = self.extract_standards_from_text(query_text)
            for c in cited:
                c_val = self.validate_standard(c)
                if c_val["status"] in ["OBSOLETE", "WITHDRAWN"]:
                    cited_superseded.append(c_val)

        merged = dict(candidate)
        merged.update({
            "regulatory_status": val["status"],
            "lifecycle_state": val["lifecycle_state"],
            "alert_badge": val["alert_badge"],
            "is_qco_mandatory": val["is_qco_mandatory"],
            "qco_order": val["qco_order"],
            "qco_badge": val["qco_badge"],
            "qco_details": val["qco_details"],
            "statutory_clause": val["statutory_clause"],
            "normative_bundle": val["normative_bundle"],
            "cited_obsolete_warnings": cited_superseded
        })
        return merged

    def audit_text_standards(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive procurement RFP text auditor:
        1. Extracts all referenced standards
        2. Validates lifecycle for each
        3. Identifies mandatory QCO products
        4. Links testing schedules
        5. Computes overall regulatory compliance score and risk level
        """
        extracted = self.extract_standards_from_text(text)
        detailed_audits = [self.validate_standard(s) for s in extracted]

        current_count = sum(1 for a in detailed_audits if a["lifecycle_state"] == "CURRENT")
        superseded_count = sum(1 for a in detailed_audits if a["lifecycle_state"] == "SUPERSEDED")
        withdrawn_count = sum(1 for a in detailed_audits if a["lifecycle_state"] == "WITHDRAWN")
        unspecified_count = sum(1 for a in detailed_audits if a["lifecycle_state"] == "UNSPECIFIED")
        qco_mandatory_count = sum(1 for a in detailed_audits if a["is_qco_mandatory"])

        # Determine overall compliance risk level
        if withdrawn_count > 0:
            risk_level = "CRITICAL"
            compliance_status = "NON_COMPLIANT_WITHDRAWN"
            overall_summary = "CRITICAL: Tender cites officially WITHDRAWN BIS standards. Disqualifying regulatory flaw."
        elif superseded_count > 0:
            risk_level = "HIGH"
            compliance_status = "NON_COMPLIANT_OBSOLETE"
            overall_summary = "HIGH RISK: Tender cites obsolete superseded standards. Violates CVC / GFR anti-restrictive guidelines."
        elif unspecified_count > 0:
            risk_level = "MEDIUM"
            compliance_status = "AMBIGUOUS_REVISION"
            overall_summary = "MEDIUM RISK: Standards cited without revision year. Specific active revision should be mandated."
        elif len(extracted) > 0:
            risk_level = "LOW"
            compliance_status = "FULLY_COMPLIANT"
            overall_summary = "COMPLIANT: All cited standards are active and validated against BIS registry."
        else:
            risk_level = "MEDIUM"
            compliance_status = "NO_STANDARDS_FOUND"
            overall_summary = "ADVISORY: No Indian Standards (IS) explicitly cited in the technical specification."

        # Compile statutory clauses to inject
        statutory_clauses = []
        for a in detailed_audits:
            clause = a.get("statutory_clause")
            if clause and clause not in statutory_clauses:
                statutory_clauses.append(clause)

        return {
            "total_standards_cited": len(extracted),
            "current_count": current_count,
            "superseded_count": superseded_count,
            "withdrawn_count": withdrawn_count,
            "unspecified_count": unspecified_count,
            "qco_mandatory_count": qco_mandatory_count,
            "risk_level": risk_level,
            "compliance_status": compliance_status,
            "overall_summary": overall_summary,
            "statutory_clauses": statutory_clauses,
            "audits": detailed_audits
        }
