"""
ManakSetu Bill of Quantities (BoQ) Batch Auditor (Phase 5)
Grounding:
- Automated Multi-Item Excel (.xlsx / .xls) Processing via Pandas & OpenPyXL
- Line-by-Line BIS Standards Harmonization, QCO Verification & CVC Anti-Tailoring Check
- 6-Column Standardized Export with Instant Download Link
"""
import io
import re
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd

from app.core.config import settings
from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter
from app.services.foreign_converter import ForeignConverter
from app.services.hybrid_retriever import HybridRetriever


class BoQProcessor:
    """
    High-throughput Bill of Quantities (BoQ) batch auditor.
    Scans multi-item spreadsheets, identifies referenced or unstated standards,
    evaluates QCO mandates, flags CVC brand-tailoring, and appends 6 audit columns.
    """

    DESCRIPTION_ALIASES = [
        "item_description", "description", "item description", "item particulars",
        "particulars", "specification", "technical specification", "scope of supply",
        "item name", "item", "work description", "material description"
    ]
    ITEM_NO_ALIASES = ["item_no", "item no", "sl no", "s.no", "sl.no", "sr no", "sr.no", "no", "item #"]
    QTY_ALIASES = ["quantity", "qty", "quantities", "req qty", "total qty", "tender qty"]
    UNIT_ALIASES = ["unit", "uom", "unit of measure", "units", "rate unit"]

    def __init__(
        self,
        regulatory_engine: Optional[RegulatoryEngine] = None,
        cvc_linter: Optional[CVCLinter] = None,
        foreign_converter: Optional[ForeignConverter] = None,
        retriever: Optional[HybridRetriever] = None
    ):
        self.regulatory_engine = regulatory_engine if regulatory_engine is not None else RegulatoryEngine()
        self.foreign_converter = foreign_converter if foreign_converter is not None else ForeignConverter()
        self.cvc_linter = cvc_linter if cvc_linter is not None else CVCLinter(foreign_converter=self.foreign_converter)
        self.retriever = retriever  # Lazy loaded if None

        # Ensure static export directory exists
        self.export_dir = Path(__file__).resolve().parent.parent / "static" / "exports"
        self.export_dir.mkdir(parents=True, exist_ok=True)

    def _find_column(self, df: pd.DataFrame, aliases: List[str]) -> Optional[str]:
        """Matches column header against known aliases."""
        for col in df.columns:
            clean_col = str(col).strip().lower().replace("_", " ")
            if clean_col in aliases:
                return col
        # Fallback: substring matching
        for col in df.columns:
            clean_col = str(col).strip().lower()
            for a in aliases:
                if a in clean_col:
                    return col
        return None

    def audit_line_item(self, raw_desc: str) -> Dict[str, Any]:
        """
        Audits a single BoQ item description:
        1. Identifies Indian Standards cited or inferred.
        2. Validates lifecycle (CURRENT / SUPERSEDED / WITHDRAWN).
        3. Identifies mandatory QCO orders.
        4. Detects CVC brand violations and foreign standards.
        5. Computes recommended standard and compliance action.
        """
        if not raw_desc or not raw_desc.strip():
            return {
                "recommended_is_code": "N/A",
                "standard_title": "Empty Description",
                "lifecycle_status": "NO_DATA",
                "mandatory_qco": "NO - VOLUNTARY",
                "cvc_tailoring_alerts": "None",
                "compliance_action": "NO_ACTION",
                "status": "PASS"
            }

        # 1. Detect explicitly cited standards
        cited_standards = self.regulatory_engine.extract_standards_from_text(raw_desc)
        
        # 2. Detect brands and foreign standards
        brands = self.cvc_linter.extract_brands(raw_desc)
        foreign_conversions = self.foreign_converter.scan_and_convert(raw_desc)

        # 3. Determine primary standard candidate
        best_standard_code = None
        standard_title = "Standard Specification"
        lifecycle_status = "CURRENT"
        is_qco = False
        qco_badge = "NO - VOLUNTARY"
        alerts = []

        # If standard cited directly
        if cited_standards:
            primary_cited = cited_standards[0]
            val = self.regulatory_engine.validate_standard(primary_cited)
            best_standard_code = val.get("recommended_standard") or primary_cited
            standard_title = val.get("title") or "Indian Standard"
            lifecycle_status = val.get("lifecycle_state", "CURRENT")
            is_qco = val.get("is_qco_mandatory", False)
            qco_badge = "YES - ISI MARK REQUIRED" if is_qco else "NO - VOLUNTARY"

            if val["status"] == "OBSOLETE":
                alerts.append(f"Obsolete '{primary_cited}' upgraded to '{best_standard_code}'")
            elif val["status"] == "WITHDRAWN":
                alerts.append(f"WITHDRAWN standard '{primary_cited}' upgraded to '{best_standard_code}'")
            elif val["status"] == "UNSPECIFIED_REVISION":
                alerts.append(f"Unspecified revision year for '{primary_cited}'. Use '{best_standard_code}'")

        # If foreign standard cited
        elif foreign_conversions and foreign_conversions[0].get("equivalent_is_code"):
            fc = foreign_conversions[0]
            best_standard_code = fc["equivalent_is_code"]
            standard_title = fc.get("title") or "Harmonized Indian Standard"
            val = self.regulatory_engine.validate_standard(best_standard_code)
            is_qco = val.get("is_qco_mandatory", False)
            qco_badge = "YES - ISI MARK REQUIRED" if is_qco else "NO - VOLUNTARY"
            alerts.append(f"Foreign code '{fc['foreign_standard']}' converted under GFR 144(vii)")

        # Fallback: Infer standard using hybrid retrieval if available
        else:
            if self.retriever is None:
                self.retriever = HybridRetriever()
            ret_results = self.retriever.search(raw_desc, top_k=1)
            if ret_results and ret_results[0].get("score", 0) >= 0.50:
                top_match = ret_results[0]
                best_standard_code = top_match["is_code"]
                standard_title = top_match["title"]
                is_qco = top_match.get("is_qco_mandatory", False)
                qco_badge = "YES - ISI MARK REQUIRED" if is_qco else "NO - VOLUNTARY"
                lifecycle_status = "CURRENT"
                alerts.append("Inferred standard based on technical parameters")
            else:
                best_standard_code = "UNSPECIFIED"
                standard_title = "Standard not explicitly mapped"
                lifecycle_status = "NO_STANDARD_MAPPED"

        # Brand alerts
        if brands:
            alerts.append(f"Proprietary brand(s) detected: {', '.join(brands)}")

        # Determine Compliance Action
        has_critical = (lifecycle_status in ["SUPERSEDED", "WITHDRAWN"]) or (len(brands) > 0)
        
        if lifecycle_status == "WITHDRAWN":
            compliance_action = "CRITICAL: REPLACE_WITHDRAWN_STANDARD"
            status = "FAIL"
        elif lifecycle_status == "SUPERSEDED":
            compliance_action = "REPLACE_OBSOLETE_STANDARD"
            status = "FAIL"
        elif brands:
            compliance_action = "REMOVE_PROPRIETARY_BRAND"
            status = "FAIL"
        elif foreign_conversions:
            compliance_action = "CONVERT_FOREIGN_STANDARD"
            status = "WARN"
        elif is_qco:
            compliance_action = "MANDATE_QCO_ISI_MARK"
            status = "PASS"
        else:
            compliance_action = "APPROVED"
            status = "PASS"

        return {
            "recommended_is_code": best_standard_code or "N/A",
            "standard_title": standard_title,
            "lifecycle_status": lifecycle_status,
            "mandatory_qco": qco_badge,
            "cvc_tailoring_alerts": "; ".join(alerts) if alerts else "None (Clean Spec)",
            "compliance_action": compliance_action,
            "status": status,
            "detected_brands": brands,
            "foreign_standards": [fc["foreign_standard"] for fc in foreign_conversions]
        }

    def process_dataframe(self, df: pd.DataFrame, filename_prefix: str = "audited_boq") -> Dict[str, Any]:
        """
        Audits entire pandas DataFrame and appends 6 standardized audit columns.
        """
        desc_col = self._find_column(df, self.DESCRIPTION_ALIASES)
        if desc_col is None:
            # Pick first string-heavy column
            for col in df.columns:
                if df[col].dtype == object:
                    desc_col = col
                    break
        if desc_col is None:
            desc_col = df.columns[0]

        item_no_col = self._find_column(df, self.ITEM_NO_ALIASES)
        qty_col = self._find_column(df, self.QTY_ALIASES)
        unit_col = self._find_column(df, self.UNIT_ALIASES)

        results = []
        compliant_count = 0
        flagged_count = 0

        # Create output audit lists
        rec_codes = []
        titles = []
        lifecycles = []
        qcos = []
        cvc_alerts = []
        actions = []

        for idx, row in df.iterrows():
            item_id = row[item_no_col] if (item_no_col and pd.notna(row[item_no_col])) else (idx + 1)
            raw_desc = str(row[desc_col]) if pd.notna(row[desc_col]) else ""
            qty = row[qty_col] if (qty_col and pd.notna(row[qty_col])) else "N/A"
            unit = row[unit_col] if (unit_col and pd.notna(row[unit_col])) else ""

            audit_item = self.audit_line_item(raw_desc)

            if audit_item["status"] in ["FAIL", "WARN"]:
                flagged_count += 1
            else:
                compliant_count += 1

            rec_codes.append(audit_item["recommended_is_code"])
            titles.append(audit_item["standard_title"])
            lifecycles.append(audit_item["lifecycle_status"])
            qcos.append(audit_item["mandatory_qco"])
            cvc_alerts.append(audit_item["cvc_tailoring_alerts"])
            actions.append(audit_item["compliance_action"])

            results.append({
                "item_no": str(item_id),
                "original_description": raw_desc,
                "quantity": str(qty),
                "unit": str(unit),
                "recommended_is_code": audit_item["recommended_is_code"],
                "standard_title": audit_item["standard_title"],
                "lifecycle_status": audit_item["lifecycle_status"],
                "mandatory_qco": audit_item["mandatory_qco"],
                "cvc_tailoring_alerts": audit_item["cvc_tailoring_alerts"],
                "compliance_action": audit_item["compliance_action"],
                "status": audit_item["status"]
            })

        # Append standardized columns to a copy of DataFrame
        df_export = df.copy()
        df_export["Recommended_IS_Code"] = rec_codes
        df_export["Standard_Title"] = titles
        df_export["Lifecycle_Status"] = lifecycles
        df_export["Mandatory_QCO"] = qcos
        df_export["CVC_Tailoring_Alerts"] = cvc_alerts
        df_export["Compliance_Action"] = actions

        # Export to static/exports
        timestamp = int(time.time())
        export_filename = f"{filename_prefix}_{timestamp}.xlsx"
        export_path = self.export_dir / export_filename
        df_export.to_excel(str(export_path), index=False)

        total_items = len(results)
        compliance_rate = round((compliant_count / total_items * 100.0), 1) if total_items > 0 else 100.0

        return {
            "total_items_scanned": total_items,
            "compliant_items": compliant_count,
            "flagged_items": flagged_count,
            "overall_compliance_rate": compliance_rate,
            "export_filename": export_filename,
            "download_url": f"/static/exports/{export_filename}",
            "export_path": str(export_path),
            "items": results
        }

    def process_excel_bytes(self, excel_bytes: bytes, filename_prefix: str = "audited_boq") -> Dict[str, Any]:
        """Parses in-memory Excel bytes."""
        df = pd.read_excel(io.BytesIO(excel_bytes))
        return self.process_dataframe(df, filename_prefix=filename_prefix)

    def process_excel_file(self, file_path: str) -> Dict[str, Any]:
        """Parses local Excel file on disk."""
        p = Path(file_path)
        df = pd.read_excel(p)
        return self.process_dataframe(df, filename_prefix=p.stem)
