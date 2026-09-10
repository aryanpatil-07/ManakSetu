"""
Foreign Standard to Indian Standard (BIS) Converter (Phase 4)
Grounding:
- General Financial Rules (GFR 2017) Rule 144(vii)
- Public Procurement (Preference to Make in India) Order 2017
- BIS Harmonization & National Equivalence Framework
"""
import json
import re
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.core.config import settings


class ForeignConverter:
    """
    Translates foreign standards (ASTM, DIN, ISO, BS, IEC, EN) to equivalent
    Indian Standards (IS) under GFR 2017 Rule 144(vii).
    """

    def __init__(self):
        self.mappings: Dict[str, Dict[str, Any]] = {}
        self.foreign_regex = re.compile(
            r'\b(ASTM|DIN|EN|BS|ISO|IEC)\s+([A-Z0-9\-]+(?:\s*(?:Part|Section|Sec)\s*[0-9]+)?)\b',
            re.IGNORECASE
        )
        self._load_mappings()

    def _load_mappings(self):
        """Loads ASTM/DIN/ISO to IS mappings from foreign_mapping.json."""
        if settings.FOREIGN_MAPPING_PATH.exists():
            with open(settings.FOREIGN_MAPPING_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    norm_key = self.normalize_foreign_code(k)
                    self.mappings[norm_key] = v

    def normalize_foreign_code(self, code: str) -> str:
        """Standardizes foreign code spacing e.g. 'astm  d3035' -> 'ASTM D3035'."""
        if not code:
            return ""
        s = code.strip().upper()
        s = re.sub(r'\s+', ' ', s)
        return s

    def detect_foreign_standards(self, text: str) -> List[str]:
        """
        Finds all foreign standard citations in free text.
        Example: 'ASTM D3035', 'DIN 8074', 'ISO 4427', 'BS 1387', 'IEC 60076'
        """
        if not text:
            return []
        
        matches = self.foreign_regex.finditer(text)
        found = []
        for m in matches:
            code = f"{m.group(1).upper()} {m.group(2).upper()}"
            code = re.sub(r'\s+', ' ', code)
            if code not in found:
                found.append(code)
        return found

    def convert_code(self, foreign_code: str) -> Optional[Dict[str, Any]]:
        """
        Returns the equivalent Indian Standard for a single foreign code.
        """
        norm_code = self.normalize_foreign_code(foreign_code)
        
        # Exact lookup
        if norm_code in self.mappings:
            entry = self.mappings[norm_code]
            return {
                "foreign_standard": norm_code,
                "equivalent_is_code": entry.get("equivalent_is_code", entry.get("equivalent_is")),
                "equivalence_level": entry.get("equivalence_level", "Direct National Equivalent"),
                "equivalence_type": entry.get("equivalence_type", "DIRECT_EQUIVALENT"),
                "gfr_citation": entry.get("gfr_citation", (
                    f"Under GFR 2017 Rule 144(vii), technical specifications must be based on national standards where available. "
                    f"Foreign standard [{norm_code}] has been converted to Indian Standard [{entry.get('equivalent_is_code', '')}]."
                )),
                "advisory": entry.get("advisory", ""),
                "issuing_body": entry.get("issuing_body", ""),
                "title": entry.get("title", "")
            }

        # Prefix match with delimiter boundary (e.g. 'ISO 4427-1' -> 'ISO 4427')
        sorted_keys = sorted(self.mappings.keys(), key=len, reverse=True)
        for k in sorted_keys:
            entry = self.mappings[k]
            if norm_code == k or norm_code.startswith(k + "-") or norm_code.startswith(k + " ") or norm_code.startswith(k + "/"):
                return {
                    "foreign_standard": norm_code,
                    "equivalent_is_code": entry.get("equivalent_is_code", entry.get("equivalent_is")),
                    "equivalence_level": entry.get("equivalence_level", "Harmonized Equivalent"),
                    "equivalence_type": entry.get("equivalence_type", "HARMONIZED_EQUIVALENT"),
                    "gfr_citation": entry.get("gfr_citation", (
                        f"Under GFR 2017 Rule 144(vii), national standard [{entry.get('equivalent_is_code', '')}] "
                        f"supersedes foreign code [{norm_code}]."
                    )),
                    "advisory": entry.get("advisory", ""),
                    "issuing_body": entry.get("issuing_body", ""),
                    "title": entry.get("title", "")
                }

        return None

    def convert_standard(self, foreign_code: str) -> Optional[Dict[str, Any]]:
        """Alias for convert_code()."""
        return self.convert_code(foreign_code)

    def scan_and_convert(self, text: str) -> List[Dict[str, Any]]:
        """
        Scans procurement text and returns conversion payloads for every cited foreign standard.
        """
        detected = self.detect_foreign_standards(text)
        conversions = []
        for code in detected:
            res = self.convert_code(code)
            if res:
                conversions.append(res)
            else:
                conversions.append({
                    "foreign_standard": code,
                    "equivalent_is_code": None,
                    "equivalence_level": "Unmapped Foreign Standard",
                    "equivalence_type": "UNMAPPED",
                    "gfr_citation": (
                        f"WARNING under GFR 2017 Rule 144(vii): Foreign standard [{code}] is cited without an explicit BIS equivalent. "
                        f"Foreign standards should not be mandated without prior administrative approval."
                    ),
                    "advisory": f"Audit specification to determine suitable Indian Standard equivalent for {code}.",
                    "issuing_body": "Foreign Standards Organization",
                    "title": ""
                })
        return conversions

    def replace_foreign_standards(self, text: str) -> str:
        """
        Substitutes foreign standard citations with national IS standard equivalents.
        Example: 'pipes per ASTM D3035' -> 'pipes per IS 4984:2016 (Indian Standard Equivalent under GFR 144(vii))'
        """
        if not text:
            return ""

        result = text
        conversions = self.scan_and_convert(text)
        for c in conversions:
            foreign_code = c["foreign_standard"]
            is_code = c.get("equivalent_is_code")
            if is_code:
                # Replace pattern
                pattern = re.compile(rf'\b{re.escape(foreign_code)}\b', re.IGNORECASE)
                replacement = f"{is_code} (Equivalent Indian Standard as per GFR 144(vii))"
                result = pattern.sub(replacement, result)

        return result
