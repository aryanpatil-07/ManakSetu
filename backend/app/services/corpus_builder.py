"""
Corpus Builder for ManakSetu Standards Knowledge Base
Generates unified text representations of Indian Standards for lexical and dense retrieval.
"""
import json
from pathlib import Path
from typing import List, Dict, Any
from app.core.config import settings

class CorpusBuilder:
    """
    Builds rich, searchable document strings from standards_master.json.
    """
    def __init__(self, standards_path=None):
        self.standards_path = standards_path or settings.STANDARDS_MASTER_PATH
        self.standards: List[Dict[str, Any]] = []
        self.documents: List[str] = []
        self._load()

    def _load(self):
        if not self.standards_path.exists():
            return
        with open(self.standards_path, "r", encoding="utf-8") as f:
            self.standards = json.load(f)

        self.documents = []
        for s in self.standards:
            doc = self.format_document(s)
            self.documents.append(doc)

    @staticmethod
    def format_document(std: Dict[str, Any]) -> str:
        """
        Creates a dense textual representation combining codes, titles, scope,
        keywords, grades, pressure ratings, and normative testing references.
        """
        parts = [
            f"Standard Code: {std.get('is_code', '')}",
            f"Standard Number: {std.get('standard_number', '')}",
            f"Title: {std.get('title', '')}",
            f"Category: {std.get('category', '')}",
            f"Division: {std.get('division', '')}",
            f"Scope: {std.get('scope', '')}",
            f"Keywords: {' '.join(std.get('keywords', []))}",
            f"Material Grades: {' '.join(std.get('material_grades', []))}",
            f"Pressure Ratings: {' '.join(std.get('pressure_ratings', []))}",
            f"Supersedes: {' '.join(std.get('supersedes', []))}"
        ]
        normative = std.get("normative_references", {})
        if normative:
            raw_mats = " ".join(normative.get("raw_material", []))
            tests = " ".join(normative.get("testing_methods", []))
            allied = " ".join(normative.get("allied_fittings", []))
            parts.append(f"Normative Testing Standards: {tests}")
            parts.append(f"Raw Material Standards: {raw_mats}")
            parts.append(f"Allied Specifications: {allied}")

        foreign = std.get("foreign_equivalents", [])
        if foreign:
            parts.append(f"Foreign Equivalent Codes: {' '.join(foreign)}")

        return " | ".join(parts)

    def get_corpus(self) -> List[str]:
        return self.documents

    def get_standards(self) -> List[Dict[str, Any]]:
        return self.standards
