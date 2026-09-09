"""
ManakSetu PDF RFP Document Scrutinizer (Phase 5)
Grounding:
- PyMuPDF (fitz) High-Performance Section Slicing
- Automated Technical Specification & Schedule of Requirements Ingestion
- Consolidated Document-Level Compliance Scorecard
"""
import io
import re
from typing import Optional, Dict, Any, List
from pathlib import Path

from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter
from app.services.foreign_converter import ForeignConverter
from app.services.clause_generator import ClauseGenerator
from app.services.hybrid_retriever import HybridRetriever


class DocumentParser:
    """
    Ingests PDF tender documents, identifies technical specification sections,
    extracts procurement clauses, audits them against BIS, QCO, and CVC rules,
    and produces an executive audit scorecard.
    """

    SECTION_PATTERNS = [
        (r'(?i)(?:SECTION\s*[0-9\.]*\s*[:\-]?\s*)?(?:TECHNICAL\s+SPECIFICATION(?:S)?|SPECIFICATIONS?\s+FOR\s+MATERIALS)', "Technical Specifications"),
        (r'(?i)(?:SECTION\s*[0-9\.]*\s*[:\-]?\s*)?(?:SCHEDULE\s+OF\s+REQUIREMENTS?|REQUIREMENTS?\s+SCHEDULE)', "Schedule of Requirements"),
        (r'(?i)(?:SECTION\s*[0-9\.]*\s*[:\-]?\s*)?(?:SCOPE\s+OF\s+(?:WORK|SUPPLY)|TERMS\s+OF\s+REFERENCE)', "Scope of Work / Supply"),
        (r'(?i)(?:SECTION\s*[0-9\.]*\s*[:\-]?\s*)?(?:BILL\s+OF\s+QUANTITIES|BOQ|PRICE\s+SCHEDULE)', "Bill of Quantities / BoQ"),
        (r'(?i)(?:SECTION\s*[0-9\.]*\s*[:\-]?\s*)?(?:SPECIAL\s+CONDITIONS\s+OF\s+CONTRACT|TECHNICAL\s+TERMS)', "Special Conditions / Technical Terms")
    ]

    def __init__(
        self,
        regulatory_engine: Optional[RegulatoryEngine] = None,
        cvc_linter: Optional[CVCLinter] = None,
        foreign_converter: Optional[ForeignConverter] = None,
        clause_generator: Optional[ClauseGenerator] = None,
        retriever: Optional[HybridRetriever] = None
    ):
        self._has_fitz = False
        try:
            import fitz  # PyMuPDF
            self._has_fitz = True
        except ImportError:
            self._has_fitz = False

        self.regulatory_engine = regulatory_engine if regulatory_engine is not None else RegulatoryEngine()
        self.foreign_converter = foreign_converter if foreign_converter is not None else ForeignConverter()
        self.cvc_linter = cvc_linter if cvc_linter is not None else CVCLinter(foreign_converter=self.foreign_converter)
        self.clause_generator = clause_generator if clause_generator is not None else ClauseGenerator(
            regulatory_engine=self.regulatory_engine,
            cvc_linter=self.cvc_linter,
            foreign_converter=self.foreign_converter
        )
        self.retriever = retriever  # Lazy loaded if needed

    def parse_pdf_bytes(self, pdf_bytes: bytes, filename: str = "tender_document.pdf") -> Dict[str, Any]:
        """Extract text, page count, and metadata from raw PDF bytes."""
        if not self._has_fitz:
            text_content = pdf_bytes.decode("utf-8", errors="ignore")
            return {
                "text": text_content,
                "total_pages": 1,
                "pages_text": [text_content],
                "engine": "TextDecoderFallback",
                "filename": filename
            }

        import fitz
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        total_pages = len(doc)
        pages_text = []
        full_text = []

        for page_num in range(total_pages):
            page = doc.load_page(page_num)
            txt = page.get_text()
            pages_text.append(txt)
            full_text.append(txt)

        doc.close()
        return {
            "text": "\n".join(full_text),
            "total_pages": total_pages,
            "pages_text": pages_text,
            "engine": "PyMuPDF",
            "filename": filename
        }

    def parse_pdf_file(self, file_path: str) -> Dict[str, Any]:
        """Parses a local PDF file."""
        p = Path(file_path)
        with open(p, "rb") as f:
            return self.parse_pdf_bytes(f.read(), filename=p.name)

    def extract_sections(self, pages_text: List[str]) -> List[Dict[str, Any]]:
        """
        Slices PDF text into recognizable procurement sections.
        """
        sections = []
        full_doc = "\n".join(pages_text)

        # Find section boundaries
        boundaries = []
        for pattern_str, section_name in self.SECTION_PATTERNS:
            for match in re.finditer(pattern_str, full_doc):
                boundaries.append({
                    "start": match.start(),
                    "title": section_name,
                    "matched_header": match.group(0).strip()
                })

        boundaries.sort(key=lambda x: x["start"])

        if not boundaries:
            # If no formal headers found, treat entire document as general technical scope
            return [{
                "title": "General Procurement Scope",
                "header": "Tender Document Content",
                "content": full_doc.strip()
            }]

        for i, b in enumerate(boundaries):
            start = b["start"]
            end = boundaries[i + 1]["start"] if i + 1 < len(boundaries) else len(full_doc)
            content = full_doc[start:end].strip()
            sections.append({
                "title": b["title"],
                "header": b["matched_header"],
                "content": content
            })

        return sections

    def scrutinize_pdf(self, pdf_bytes: bytes, filename: str = "tender_document.pdf") -> Dict[str, Any]:
        """
        End-to-End PDF Scrutinizer:
        1. Ingests PDF bytes via PyMuPDF.
        2. Identifies key sections.
        3. Parses clauses and audits standards, QCO orders, and CVC anti-tailoring rules.
        4. Compiles a consolidated document-level Audit Scorecard.
        """
        parsed = self.parse_pdf_bytes(pdf_bytes, filename=filename)
        sections = self.extract_sections(parsed["pages_text"])
        full_text = parsed["text"]

        # Run audits across text
        standards_audit = self.regulatory_engine.audit_text_standards(full_text)
        cvc_audit = self.cvc_linter.audit_text(full_text)
        foreign_conversions = self.foreign_converter.scan_and_convert(full_text)

        # Deduce primary standard candidate if any
        primary_standard = None
        if standards_audit["audits"]:
            primary_standard = standards_audit["audits"][0].get("recommended_standard")
        elif foreign_conversions and foreign_conversions[0].get("equivalent_is_code"):
            primary_standard = foreign_conversions[0]["equivalent_is_code"]

        # Synthesize replacement clause if standards found
        synthesized_clause = None
        if primary_standard:
            clause_res = self.clause_generator.generate_clause(
                item_category=filename.replace(".pdf", "").replace("_", " ").title(),
                standard_code=primary_standard
            )
            synthesized_clause = clause_res["synthesized_clause_text"]

        # Calculate consolidated document score (0 to 100)
        # Combines CVC compliance and regulatory compliance
        cvc_score = cvc_audit["cvc_compliance_score"]
        deductions = 0.0
        if standards_audit["withdrawn_count"] > 0:
            deductions += 40.0
        if standards_audit["superseded_count"] > 0:
            deductions += 25.0 * standards_audit["superseded_count"]
        if standards_audit["unspecified_count"] > 0:
            deductions += 10.0 * standards_audit["unspecified_count"]

        overall_score = max(0.0, min(100.0, cvc_score - deductions))
        overall_score = round(overall_score, 1)

        # Determine document risk level
        if standards_audit["withdrawn_count"] > 0 or cvc_audit["severity_counts"]["CRITICAL"] > 0 or overall_score < 40:
            doc_risk = "CRITICAL"
        elif standards_audit["superseded_count"] > 0 or cvc_audit["severity_counts"]["HIGH"] > 0 or overall_score < 70:
            doc_risk = "HIGH"
        elif standards_audit["unspecified_count"] > 0 or overall_score < 85:
            doc_risk = "MEDIUM"
        else:
            doc_risk = "LOW"

        # Executive summary
        summary_points = []
        if standards_audit["withdrawn_count"] > 0:
            summary_points.append(f"Tender cites {standards_audit['withdrawn_count']} officially WITHDRAWN BIS standard(s). Immediate disqualification risk.")
        if standards_audit["superseded_count"] > 0:
            summary_points.append(f"Tender cites {standards_audit['superseded_count']} obsolete revision(s) requiring active upgrade.")
        if cvc_audit["detected_brands"]:
            summary_points.append(f"Detected {len(cvc_audit['detected_brands'])} proprietary brand name(s) ({', '.join(cvc_audit['detected_brands'])}), violating CVC OM No. 03-05-1-CTE-9.")
        if foreign_conversions:
            summary_points.append(f"Detected {len(foreign_conversions)} foreign standard(s) requiring conversion under GFR 2017 Rule 144(vii).")
        if standards_audit["qco_mandatory_count"] > 0:
            summary_points.append(f"{standards_audit['qco_mandatory_count']} item(s) are governed by mandatory QCOs requiring compulsory ISI / CRS mark under Section 16 of the BIS Act, 2016.")
        if not summary_points:
            summary_points.append("All technical specifications conform to active BIS standards and CVC brand-neutrality guidelines.")

        return {
            "document_name": filename,
            "total_pages": parsed["total_pages"],
            "sections_identified": [
                {"title": s["title"], "header": s.get("header", ""), "preview": s["content"][:160] + "..."}
                for s in sections
            ],
            "total_requirements_analyzed": len(sections),
            "overall_compliance_score": overall_score,
            "risk_rating": doc_risk,
            "standards_audit": standards_audit,
            "cvc_audit": cvc_audit,
            "foreign_conversions": foreign_conversions,
            "statutory_clauses": standards_audit["statutory_clauses"],
            "executive_summary": " | ".join(summary_points),
            "synthesized_harmonized_clause": synthesized_clause
        }
