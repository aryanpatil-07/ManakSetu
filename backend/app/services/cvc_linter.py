import json
import re
from typing import List, Dict, Any
from app.core.config import settings

class CVCLinter:
    """
    Central Vigilance Commission (CVC) anti-tailoring compliance scanner.
    Detects proprietary brand names, unjustified foreign standards,
    obsolete standards, and missing QCO clauses.
    """
    def __init__(self):
        self.rules: List[Dict[str, Any]] = []
        self.foreign_mappings: Dict[str, Any] = {}
        self._load_rules()

    def _load_rules(self):
        if settings.CVC_RULES_PATH.exists():
            with open(settings.CVC_RULES_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.rules = data.get("rules", [])

        if settings.FOREIGN_MAPPING_PATH.exists():
            with open(settings.FOREIGN_MAPPING_PATH, "r", encoding="utf-8") as f:
                self.foreign_mappings = json.load(f)

    def scan(self, text: str) -> List[Dict[str, Any]]:
        violations = []
        lines = text.split("\n")

        # 1. Evaluate CVC regex rules
        for rule in self.rules:
            pattern = rule.get("pattern")
            if not pattern:
                continue

            for idx, line in enumerate(lines):
                matches = re.finditer(pattern, line)
                for match in matches:
                    violations.append({
                        "rule_id": rule["rule_id"],
                        "rule_name": rule["rule_name"],
                        "severity": rule["severity"],
                        "matched_text": match.group(0),
                        "message": rule["message"],
                        "recommended_action": rule["recommended_action"],
                        "line_or_context": f"Line {idx + 1}: {line.strip()[:140]}"
                    })

        # 2. Check for foreign standard citations without BIS equivalence
        for foreign_code, mapping in self.foreign_mappings.items():
            pattern = rf'\b{re.escape(foreign_code)}\b'
            for idx, line in enumerate(lines):
                if re.search(pattern, line, re.IGNORECASE):
                    # Check if line also mentions Indian standard or equivalent
                    if not re.search(r'(?:IS\s*\d+|equivalent|harmonized|or\s+equal)', line, re.IGNORECASE):
                        violations.append({
                            "rule_id": "FOREIGN-STD-DIRECT",
                            "rule_name": f"Foreign Standard Cited Without Mandatory BIS Equivalence ({foreign_code})",
                            "severity": "HIGH",
                            "matched_text": foreign_code,
                            "message": f"'{foreign_code}' cited without equivalent Indian standard '{mapping['equivalent_is']}'.",
                            "recommended_action": mapping["advisory"],
                            "line_or_context": f"Line {idx + 1}: {line.strip()[:140]}"
                        })

        return violations
