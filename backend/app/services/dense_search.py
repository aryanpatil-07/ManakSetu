"""
Dense Semantic Embedding Engine for Technical Standards
Uses SentenceTransformers with precomputed and disk-cached normalized embeddings.
"""
import os
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import torch
from app.core.config import settings
from app.services.corpus_builder import CorpusBuilder

CACHE_PATH = Path("d:/ManakSetu/backend/app/data/embeddings_cache.pt")
METADATA_PATH = Path("d:/ManakSetu/backend/app/data/embeddings_meta.json")

class DenseSearchEngine:
    """
    Dense semantic retrieval using normalized 768-dim / 384-dim embeddings
    with on-disk caching and vector cosine similarity.
    """
    def __init__(self, corpus_builder: CorpusBuilder = None, model_name: str = "BAAI/bge-small-en-v1.5"):
        self.corpus_builder = corpus_builder or CorpusBuilder()
        self.standards = self.corpus_builder.get_standards()
        self.documents = self.corpus_builder.get_corpus()
        self.model_name = model_name
        self.model = None
        self.embeddings: Optional[np.ndarray] = None
        self._initialize()

    def _compute_corpus_hash(self) -> str:
        """Hash corpus to detect changes and invalidate cache when standards change."""
        h = hashlib.sha256()
        for doc in self.documents:
            h.update(doc.encode("utf-8"))
        return h.hexdigest()

    def _initialize(self):
        """Loads embeddings from disk cache or computes them if cache is missing/stale."""
        if not self.documents:
            return

        corpus_hash = self._compute_corpus_hash()

        # Check for valid on-disk cache
        if CACHE_PATH.exists():
            try:
                cached_data = torch.load(CACHE_PATH, map_location="cpu", weights_only=False)
                if (isinstance(cached_data, dict) and
                    cached_data.get("hash") == corpus_hash and
                    len(cached_data.get("embeddings", [])) == len(self.documents)):
                    self.embeddings = cached_data["embeddings"]
                    return
            except Exception:
                pass

        # Compute embeddings
        self._compute_and_cache(corpus_hash)

    def _get_model(self):
        """Lazy loader for SentenceTransformer."""
        if self.model is None:
            from sentence_transformers import SentenceTransformer
            # Use local cache or download
            try:
                self.model = SentenceTransformer(self.model_name)
            except Exception:
                # Fallback to ultra-reliable lightweight model
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
        return self.model

    def _compute_and_cache(self, corpus_hash: str):
        """Encodes corpus and persists to disk."""
        model = self._get_model()
        embs = model.encode(
            self.documents,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        )
        self.embeddings = embs

        # Save to disk
        try:
            CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
            torch.save({
                "hash": corpus_hash,
                "embeddings": self.embeddings,
                "model": self.model_name
            }, CACHE_PATH)
        except Exception:
            pass

    def search(self, query: str, top_k: int = 20) -> List[Dict[str, Any]]:
        """
        Computes cosine similarity between query and precomputed document embeddings.
        """
        if self.embeddings is None or not self.standards:
            return []

        model = self._get_model()
        query_emb = model.encode(
            query,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        # Cosine similarity is dot product of normalized vectors
        scores = np.dot(self.embeddings, query_emb)
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for rank, idx in enumerate(top_indices):
            results.append({
                "standard": self.standards[idx],
                "score": round(float(scores[idx]), 4),
                "rank": rank + 1,
                "retrieval_source": "DenseEmbedding"
            })

        return results
