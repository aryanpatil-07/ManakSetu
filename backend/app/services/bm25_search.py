"""
BM25 Lexical Search Engine for Technical Standards
Uses rank_bm25.BM25Okapi with domain token weighting for exact technical grades.
"""
import re
from typing import List, Dict, Any, Tuple
from rank_bm25 import BM25Okapi
from app.services.corpus_builder import CorpusBuilder
from app.services.nlp_extractor import ParameterExtractor

class BM25SearchEngine:
    """
    High-precision sparse lexical retrieval over technical standards corpus.
    """
    def __init__(self, corpus_builder: CorpusBuilder = None):
        self.corpus_builder = corpus_builder or CorpusBuilder()
        self.standards = self.corpus_builder.get_standards()
        self.documents = self.corpus_builder.get_corpus()
        self.extractor = ParameterExtractor()
        self.bm25 = None
        self.tokenized_corpus = []
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize preserving technical identifiers like 'pe-100', 'is:4984', 'fe500d'."""
        clean = text.lower()
        # Keep alphanumeric, dashes, slashes for part numbers
        tokens = re.findall(r'[a-z0-9]+(?:[-/][a-z0-9]+)*', clean)
        return tokens

    def _build_index(self):
        if not self.documents:
            return
        self.tokenized_corpus = [self._tokenize(doc) for doc in self.documents]
        self.bm25 = BM25Okapi(self.tokenized_corpus)

    def search(self, query: str, top_k: int = 20) -> List[Dict[str, Any]]:
        """
        Executes BM25 search with technical parameter boosting.
        """
        if not self.bm25 or not self.standards:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)
        extracted = self.extractor.extract(query)

        # Technical parameter boosting (exact standard citations, grades, pressure ratings)
        boosted_results: List[Tuple[float, int, Dict[str, Any]]] = []
        max_score = max(scores) if len(scores) > 0 and max(scores) > 0 else 1.0

        for idx, (base_score, std) in enumerate(zip(scores, self.standards, strict=False)):
            norm_score = base_score / max_score if max_score > 0 else 0.0
            boost = 1.0

            # 1. Exact IS code or Standard Number match in query
            std_code = std.get("is_code", "").lower()
            std_num = std.get("standard_number", "").lower()
            query_lower = query.lower()

            if std_num and std_num in query_lower:
                boost += 2.5
            elif std_code and std_code in query_lower:
                boost += 2.5

            # 2. Material grade match (e.g. PE100, Fe500D)
            std_grades = [g.lower() for g in std.get("material_grades", [])]
            for query_grade in extracted["material_grades"]:
                q_clean = query_grade.lower().replace("-", "").replace(" ", "")
                for sg in std_grades:
                    if q_clean in sg.replace("-", "").replace(" ", ""):
                        boost += 1.5

            # 3. Cited foreign standard match (e.g. ASTM D3035 in foreign equivalents)
            foreign_eqs = [f.lower() for f in std.get("foreign_equivalents", [])]
            for cited in extracted["cited_standards"]:
                if any(cited.lower() in f for f in foreign_eqs):
                    boost += 2.0

            final_score = norm_score * boost
            boosted_results.append((final_score, idx, std))

        boosted_results.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "standard": std,
                "score": round(score, 4),
                "rank": rank + 1,
                "retrieval_source": "BM25"
            }
            for rank, (score, _, std) in enumerate(boosted_results[:top_k])
        ]
