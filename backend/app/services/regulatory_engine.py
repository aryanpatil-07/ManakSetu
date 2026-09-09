import json
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

class RegulatoryEngine:
    """
    Validates standards against BIS lifecycle (Active/Obsolete) and QCO mandatory orders.
    """
    def __init__(self):
        self.standards_by_code: Dict[str, Dict[str, Any]] = {}
        self.standards_by_num: Dict[str, List[Dict[str, Any]]] = {}
        self.qco_by_std_num: Dict[str, List[Dict[str, Any]]] = {}
        self._load_datasets()

    def _load_datasets(self):
        if settings.STANDARDS_MASTER_PATH.exists():
            with open(settings.STANDARDS_MASTER_PATH, "r", encoding="utf-8") as f:
                standards = json.load(f)
                for s in standards:
                    self.standards_by_code[s["is_code"].upper()] = s
                    num = s.get("standard_number", "").upper()
                    self.standards_by_num.setdefault(num, []).append(s)

        if settings.QCO_MASTER_PATH.exists():
            with open(settings.QCO_MASTER_PATH, "r", encoding="utf-8") as f:
                qcos = json.load(f)
                for q in qcos:
                    for std_num in q.get("covered_standards", []):
                        self.qco_by_std_num.setdefault(std_num.upper(), []).append(q)

    def extract_standards_from_text(self, text: str) -> List[str]:
        # Matches patterns like IS 4984:1995, IS 1180 (Part 1):2014, IS 1786, IS:456
        pattern = r'\b(IS\s*(?::\s*)?[0-9]+(?:\s*\([^\)]+\))?(?:\s*:\s*[0-9]{4})?)\b'
        matches = re.findall(pattern, text, re.IGNORECASE)
        # Clean up whitespace
        cleaned = []
        for m in matches:
            norm = re.sub(r'\s*:\s*', ':', m)
            norm = re.sub(r'\s+', ' ', norm).strip().upper()
            if norm not in cleaned:
                cleaned.append(norm)
        return cleaned

    def validate_standard(self, raw_code: str) -> Dict[str, Any]:
        norm_code = raw_code.upper().strip()
        
        # Check direct active match
        if norm_code in self.standards_by_code:
            std = self.standards_by_code[norm_code]
            return {
                "specified": raw_code,
                "status": "ACTIVE",
                "recommended_standard": std["is_code"],
                "title": std["title"],
                "is_qco_mandatory": std.get("qco_mandatory", False),
                "qco_order": std.get("qco_order"),
                "notes": "Current active BIS standard."
            }

        # Check if obsolete version
        for active_code, std in self.standards_by_code.items():
            for sup in std.get("supersedes", []):
                if sup.upper() in norm_code or norm_code in sup.upper():
                    return {
                        "specified": raw_code,
                        "status": "OBSOLETE",
                        "recommended_standard": active_code,
                        "title": std["title"],
                        "is_qco_mandatory": std.get("qco_mandatory", False),
                        "qco_order": std.get("qco_order"),
                        "notes": f"Standard '{raw_code}' was superseded by '{active_code}'. Using obsolete standards violates procurement guidelines."
                    }

        # Check by base number (e.g. IS 4984 without year)
        base_match = re.search(r'IS\s*([0-9]+)', norm_code)
        if base_match:
            std_num = f"IS {base_match.group(1)}"
            if std_num in self.standards_by_num:
                active_std = self.standards_by_num[std_num][0]
                return {
                    "specified": raw_code,
                    "status": "UNSPECIFIED_REVISION",
                    "recommended_standard": active_std["is_code"],
                    "title": active_std["title"],
                    "is_qco_mandatory": active_std.get("qco_mandatory", False),
                    "qco_order": active_std.get("qco_order"),
                    "notes": f"Missing revision year. Recommended current revision: {active_std['is_code']}."
                }

        return {
            "specified": raw_code,
            "status": "UNKNOWN",
            "recommended_standard": None,
            "title": None,
            "is_qco_mandatory": False,
            "qco_order": None,
            "notes": "Standard not found in local master dataset."
        }
