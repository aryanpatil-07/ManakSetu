import io
import pandas as pd
from typing import List, Dict, Any
from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter

class BoQProcessor:
    """
    Pandas-based Bill of Quantities (BoQ) batch auditor.
    Reads Excel (.xlsx, .xls) files and validates each line-item against
    BIS active standards, CVC anti-tailoring rules, and mandatory QCOs.
    """
    def __init__(self):
        self.regulatory_engine = RegulatoryEngine()
        self.cvc_linter = CVCLinter()

    def process_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        results = []
        compliant_count = 0
        flagged_count = 0

        # Attempt to identify key column names
        desc_col = None
        for col in df.columns:
            c = str(col).lower()
            if "desc" in c or "item" in c or "particular" in c or "specification" in c:
                desc_col = col
                break
        if desc_col is None:
            desc_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]

        for idx, row in df.iterrows():
            item_no = idx + 1
            raw_desc = str(row[desc_col]) if pd.notna(row[desc_col]) else ""
            if not raw_desc.strip():
                continue

            findings = []
            detected_standards = self.regulatory_engine.extract_standards_from_text(raw_desc)
            has_obsolete = False
            suggested_correction = None
            qco_compliant = True

            for std_code in detected_standards:
                val = self.regulatory_engine.validate_standard(std_code)
                if val["status"] == "OBSOLETE":
                    has_obsolete = True
                    rec = val["recommended_standard"]
                    findings.append(f"Obsolete standard '{std_code}'. Must be upgraded to '{rec}'.")
                    if not suggested_correction:
                        suggested_correction = raw_desc.replace(std_code, rec)
                elif val["status"] == "UNSPECIFIED_REVISION":
                    rec = val["recommended_standard"]
                    findings.append(f"Unspecified revision year for '{std_code}'. Use '{rec}'.")
                if val.get("is_qco_mandatory"):
                    findings.append(f"Mandatory QCO item ({val.get('qco_order')}). BIS ISI mark mandatory.")

            # Check for CVC violations
            violations = self.cvc_linter.scan(raw_desc)
            for v in violations:
                findings.append(f"[{v['severity']}] {v['rule_name']}: {v['matched_text']}")

            if violations or has_obsolete:
                status = "FAIL" if (any(v['severity'] == 'CRITICAL' for v in violations) or has_obsolete) else "WARN"
                flagged_count += 1
            else:
                status = "PASS"
                compliant_count += 1

            results.append({
                "item_no": item_no,
                "description": raw_desc,
                "detected_standards": detected_standards,
                "compliance_status": status,
                "findings": findings,
                "suggested_correction": suggested_correction,
                "qco_compliant": qco_compliant
            })

        total = compliant_count + flagged_count
        rate = round((compliant_count / total * 100), 2) if total > 0 else 100.0

        return {
            "total_items_scanned": total,
            "compliant_items": compliant_count,
            "flagged_items": flagged_count,
            "overall_compliance_rate": rate,
            "items": results
        }

    def process_excel_bytes(self, excel_bytes: bytes) -> Dict[str, Any]:
        df = pd.read_excel(io.BytesIO(excel_bytes))
        return self.process_dataframe(df)

    def process_excel_file(self, file_path: str) -> Dict[str, Any]:
        df = pd.read_excel(file_path)
        return self.process_dataframe(df)
