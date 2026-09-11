"""
Central Vigilance Commission (CVC) Anti-Tailoring Compliance Scanner (Phase 4)
Grounding:
- CVC Office Memorandum No. 03-05-1-CTE-9 (Anti-Tailoring Guidelines)
- General Financial Rules (GFR 2017) Rule 144(vii) & Rule 157
- Public Procurement (Preference to Make in India) Order 2017
"""
import json
import re
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.foreign_converter import ForeignConverter


class CVCLinter:
    """
    Scans procurement specifications for:
    1. Proprietary brand names & trade makes (CVC Anti-Tailoring violation)
    2. Obsolete / superseded Indian Standards (Restricting competition)
    3. Foreign standards cited without national IS equivalence (GFR 144(vii) violation)
    4. Restrictive pre-qualification criteria & single-vendor stipulations
    5. Missing statutory QCO mandatory certification clauses
    """

    def __init__(self, foreign_converter: Optional[ForeignConverter] = None):
        self.rules: List[Dict[str, Any]] = []
        self.foreign_converter = foreign_converter if foreign_converter is not None else ForeignConverter()
        self.brand_regex: Optional[re.Pattern] = None
        self._load_rules()

    def _load_rules(self):
        """Loads and compiles CVC rules from cvc_rules.json."""
        if settings.CVC_RULES_PATH.exists():
            with open(settings.CVC_RULES_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.rules = data.get("rules", [])

        # Find brand rule for quick extraction and sanitization
        for rule in self.rules:
            if rule.get("rule_id") == "CVC-01-BRAND-SPEC":
                pattern_str = rule.get("pattern", "")
                if pattern_str:
                    self.brand_regex = re.compile(pattern_str, re.IGNORECASE)

    def scan(self, text: str) -> List[Dict[str, Any]]:
        """
        Executes comprehensive CVC compliance audit against all rules.
        Returns detailed list of violation records.
        """
        if not text:
            return []

        violations = []
        lines = text.split("\n")

        # 1. Evaluate structured CVC rules
        for rule in self.rules:
            pattern = rule.get("pattern")
            if not pattern:
                continue

            compiled = re.compile(pattern, re.IGNORECASE)
            for idx, line in enumerate(lines):
                line_str = line.strip()
                if not line_str:
                    continue
                
                line_lower = line_str.lower()
                # Skip false positives on brand rule when the clause explicitly declares brand neutrality
                if rule.get("rule_id") == "CVC-01-BRAND-SPEC":
                    neutrality_cues = [
                        "brand-neutral", "brand neutral", "no specific trade names", 
                        "no proprietary", "not mandated", "strictly generic",
                        "or equivalent", "prohibits citing proprietary", "illustrative and shall be read",
                        "without generic technical", "without proprietary"
                    ]
                    if any(cue in line_lower for cue in neutrality_cues):
                        continue

                # Skip false positives on obsolete standard rule when cited in context of supersession / prohibition
                if rule.get("rule_id") == "CVC-02-OBSOLETE-STD":
                    supersession_cues = [
                        "supersede", "superseded", "supersedes", "prohibited under gfr", 
                        "replaced by", "upgraded to", "obsolete standard citation"
                    ]
                    if any(cue in line_lower for cue in supersession_cues):
                        continue
                
                matches = compiled.finditer(line)
                for match in matches:
                    matched_val = match.group(0).strip()
                    violations.append({
                        "rule_id": rule["rule_id"],
                        "rule_name": rule["rule_name"],
                        "category": rule.get("category", "CVC_VIOLATION"),
                        "severity": rule["severity"],
                        "matched_text": matched_val,
                        "authority": rule.get("authority", "CVC Guidelines / GFR 2017"),
                        "message": rule["message"],
                        "recommended_action": rule["recommended_action"],
                        "line_number": idx + 1,
                        "context": line_str[:140]
                    })

        # 2. Check for foreign standard citations via ForeignConverter
        foreign_conversions = self.foreign_converter.scan_and_convert(text)
        for fc in foreign_conversions:
            # If not already caught by rule CVC-03
            fcode = fc["foreign_standard"]
            already_flagged = any(v["matched_text"] == fcode and v["rule_id"] == "CVC-03-UNJUSTIFIED-FOREIGN-STD" for v in violations)
            if not already_flagged:
                violations.append({
                    "rule_id": "CVC-03-UNJUSTIFIED-FOREIGN-STD",
                    "rule_name": f"Foreign Standard Cited Without National Equivalence ({fcode})",
                    "category": "FOREIGN_RESTRICTIVE_CODE",
                    "severity": "HIGH",
                    "matched_text": fcode,
                    "authority": "GFR 2017 Rule 144(vii)",
                    "message": fc.get("gfr_citation", f"Foreign standard {fcode} cited without Indian Standard equivalent."),
                    "recommended_action": f"Convert to equivalent Indian Standard: {fc.get('equivalent_is_code', 'Relevant BIS Standard')}.",
                    "line_number": 1,
                    "context": f"Foreign Standard: {fcode}"
                })

        return violations

    def extract_brands(self, text: str) -> List[str]:
        """Extracts unique proprietary brand names mentioned in text."""
        if not text or not self.brand_regex:
            return []
        
        matches = self.brand_regex.findall(text)
        brands = []
        for m in matches:
            clean = m.strip()
            if clean and clean not in brands:
                brands.append(clean)
        return brands

    def calculate_score(self, violations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes CVC compliance score (0 to 100) and severity breakdown.
        Deduction scale:
        - CRITICAL: -25 points
        - HIGH:     -15 points
        - MEDIUM:   -10 points
        - LOW:       -5 points
        """
        score = 100.0
        severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

        for v in violations:
            sev = v.get("severity", "MEDIUM").upper()
            if sev in severity_counts:
                severity_counts[sev] += 1
            if sev == "CRITICAL":
                score -= 25.0
            elif sev == "HIGH":
                score -= 15.0
            elif sev == "MEDIUM":
                score -= 10.0
            else:
                score -= 5.0

        score = max(0.0, min(100.0, score))
        is_compliant = (score >= 80.0) and (severity_counts["CRITICAL"] == 0)

        if severity_counts["CRITICAL"] > 0:
            rating = "CRITICAL_VIOLATIONS"
        elif severity_counts["HIGH"] > 0:
            rating = "HIGH_RISK"
        elif severity_counts["MEDIUM"] > 0:
            rating = "MODERATE_RISK"
        elif len(violations) > 0:
            rating = "MINOR_ADVISORY"
        else:
            rating = "FULLY_CVC_COMPLIANT"

        return {
            "score": round(score, 1),
            "is_compliant": is_compliant,
            "rating": rating,
            "severity_counts": severity_counts,
            "total_violations": len(violations)
        }

    def sanitize_text(self, text: str) -> str:
        """
        Strips proprietary brand names and replaces foreign standards with neutral IS specifications.
        Example:
            'Supply of 100 MT Tata Tiscon Fe500D rebars' ->
            'Supply of 100 MT Fe500D rebars'
        """
        if not text:
            return ""

        cleaned = text
        # 1. Remove proprietary brands
        if self.brand_regex:
            # Replace brand with empty or neutral descriptor
            cleaned = self.brand_regex.sub("", cleaned)
            # Fix double spaces caused by removal
            cleaned = re.sub(r'[ \t]+', ' ', cleaned)
            # Fix dangling commas or 'or / and' artifacts
            cleaned = re.sub(r',\s*,', ',', cleaned)
            cleaned = re.sub(r'\b(?:make|brand|model)\s*:\s*', '', cleaned, flags=re.IGNORECASE)

        # 2. Convert foreign standards
        cleaned = self.foreign_converter.replace_foreign_standards(cleaned)

        return cleaned.strip()

    def audit_text(self, text: str) -> Dict[str, Any]:
        """
        Executes end-to-end CVC linter audit:
        1. Identifies violations
        2. Calculates compliance score
        3. Extracts detected brands and foreign codes
        4. Provides sanitized text
        """
        violations = self.scan(text)
        score_data = self.calculate_score(violations)
        brands = self.extract_brands(text)
        foreign_codes = self.foreign_converter.detect_foreign_standards(text)
        sanitized = self.sanitize_text(text)

        return {
            "cvc_compliance_score": score_data["score"],
            "is_cvc_compliant": score_data["is_compliant"],
            "rating": score_data["rating"],
            "severity_counts": score_data["severity_counts"],
            "total_violations": score_data["total_violations"],
            "detected_brands": brands,
            "detected_foreign_codes": foreign_codes,
            "violations": violations,
            "sanitized_text": sanitized
        }
