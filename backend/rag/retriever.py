import os
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "faiss_index"
DOCUMENTS_DIR = BASE_DIR / "rag" / "documents"

class SafetyKnowledgeRetriever:
    """
    RAG vector retriever using Sentence Transformers and FAISS.
    Includes robust fallback matching when FAISS binary is not yet generated or installed.
    """

    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.faiss_index = None
        self.embedder = None
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        meta_file = DATA_DIR / "chunks_metadata.json"
        
        # If metadata does not exist, run quick ingestion
        if not meta_file.exists():
            from rag.ingest import run_ingestion
            run_ingestion()

        if meta_file.exists():
            try:
                with open(meta_file, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
            except Exception as e:
                print(f"[Retriever] Warning: Could not read chunks metadata: {e}")

        # Attempt to load Sentence Transformers and FAISS
        try:
            from sentence_transformers import SentenceTransformer
            import faiss
            faiss_file = DATA_DIR / "index.faiss"
            if faiss_file.exists():
                self.embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
                self.faiss_index = faiss.read_index(str(faiss_file))
                print("[Retriever] Successfully initialized FAISS vector index & Sentence Transformers.")
        except Exception as e:
            # Fallback will be used seamlessly
            pass

    def retrieve(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant chunks for a given user query.
        """
        if not self.chunks:
            return []

        # 1. Vector retrieval if FAISS and embedder are initialized
        if self.faiss_index is not None and self.embedder is not None:
            try:
                import numpy as np
                query_vec = self.embedder.encode([query], convert_to_numpy=True, normalize_embeddings=True)
                distances, indices = self.faiss_index.search(query_vec.astype(np.float32), top_k)

                results = []
                for dist, idx in zip(distances[0], indices[0]):
                    if idx < len(self.chunks) and idx >= 0:
                        chunk = self.chunks[idx].copy()
                        chunk["relevance_score"] = float(dist)
                        # Extract clean snippet (first 300 characters)
                        chunk["snippet"] = chunk["text"][:350].strip() + ("..." if len(chunk["text"]) > 350 else "")
                        results.append(chunk)
                return results
            except Exception as e:
                print(f"[Retriever] Vector search exception: {e}, falling back to keyword ranking.")

        # 2. Resilient semantic-keyword fallback
        return self._fallback_keyword_search(query, top_k)

    def _fallback_keyword_search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        High-precision fallback scorer based on query token matches, title weighting, and category relevance.
        """
        # Tokenize query
        stop_words = {"what", "should", "i", "do", "if", "my", "is", "a", "an", "the", "and", "or", "to", "in", "for", "of", "can", "how"}
        query_clean = re.sub(r'[^\w\s]', ' ', query.lower())
        tokens = [t for t in query_clean.split() if t and t not in stop_words]

        scored_chunks = []
        for chunk in self.chunks:
            text = chunk.get("text", "").lower()
            title = chunk.get("title", "").lower()
            category = chunk.get("category", "").lower()

            score = 0.0
            for token in tokens:
                # Higher weight if keyword appears in title or category
                if token in title:
                    score += 3.5
                if token in category:
                    score += 2.0
                # Content frequency
                count = text.count(token)
                score += min(count * 1.0, 5.0)

            if score > 0:
                scored = chunk.copy()
                scored["relevance_score"] = round(float(score), 2)
                scored["snippet"] = chunk["text"][:350].strip() + ("..." if len(chunk["text"]) > 350 else "")
                scored_chunks.append(scored)

        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_chunks[:top_k]

# Global singleton
safety_retriever = SafetyKnowledgeRetriever()
