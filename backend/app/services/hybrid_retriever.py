import json
import re
import math
from typing import List, Dict, Any
from app.core.config import settings

class HybridRetriever:
    """
    Hybrid retriever combining BM25 lexical token matching
    with normalized keyword & cosine term-overlap weighting.
    """
    def __init__(self, standards_path=None):
        self.standards_path = standards_path or settings.STANDARDS_MASTER_PATH
        self.standards: List[Dict[str, Any]] = []
        self.corpus: List[str] = []
        self.doc_freqs: Dict[str, int] = {}
        self.avg_doc_len = 0.0
        self._load_data()

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b[a-zA-Z0-9_-]+\b', text.lower())

    def _load_data(self):
        if not self.standards_path.exists():
            return
        with open(self.standards_path, "r", encoding="utf-8") as f:
            self.standards = json.load(f)

        total_tokens = 0
        for std in self.standards:
            combined_text = f"{std.get('is_code', '')} {std.get('title', '')} {std.get('scope', '')} {' '.join(std.get('keywords', []))}"
            self.corpus.append(combined_text)
            tokens = set(self._tokenize(combined_text))
            total_tokens += len(tokens)
            for token in tokens:
                self.doc_freqs[token] = self.doc_freqs.get(token, 0) + 1

        if self.corpus:
            self.avg_doc_len = total_tokens / len(self.corpus)

    def _bm25_score(self, query_tokens: List[str], doc_tokens: List[str], k1=1.5, b=0.75) -> float:
        score = 0.0
        n_docs = len(self.corpus)
        doc_len = len(doc_tokens)
        token_counts = {}
        for t in doc_tokens:
            token_counts[t] = token_counts.get(t, 0) + 1

        for t in query_tokens:
            if t not in token_counts:
                continue
            df = self.doc_freqs.get(t, 0)
            idf = math.log((n_docs - df + 0.5) / (df + 0.5) + 1.0)
            tf = token_counts[t]
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * (doc_len / (self.avg_doc_len or 1.0)))
            score += idf * (numerator / denominator)
        return score

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        if not query_tokens or not self.standards:
            return []

        scored_results = []
        for idx, std in enumerate(self.standards):
            doc_tokens = self._tokenize(self.corpus[idx])
            bm25 = self._bm25_score(query_tokens, doc_tokens)

            # Boost exact IS standard number matches (e.g. '4984', '1180')
            boost = 1.0
            std_num = std.get("standard_number", "").lower()
            if std_num and std_num in query.lower():
                boost += 3.0
            for kw in std.get("keywords", []):
                if kw.lower() in query.lower():
                    boost += 0.5

            total_score = bm25 * boost
            if total_score > 0:
                scored_results.append((total_score, std))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [
            {**item, "retrieval_score": round(score, 3)}
            for score, item in scored_results[:top_k]
        ]
