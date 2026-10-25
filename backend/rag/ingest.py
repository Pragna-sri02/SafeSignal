import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DOCUMENTS_DIR = BASE_DIR / "rag" / "documents"
OUTPUT_DIR = BASE_DIR / "data" / "faiss_index"

def parse_markdown_with_frontmatter(file_path: Path) -> Dict[str, Any]:
    """Extracts YAML frontmatter and markdown body from document."""
    content = file_path.read_text(encoding="utf-8")
    meta = {
        "title": file_path.stem.replace("_", " ").title(),
        "publisher": "SafeSignal Trusted Knowledge Base",
        "source_url": "https://cybercrime.gov.in",
        "category": "general_safety",
        "retrieval_date": "2026-10-24"
    }

    body = content
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            raw_frontmatter = parts[1]
            body = parts[2].strip()
            for line in raw_frontmatter.strip().split("\n"):
                if ":" in line:
                    key, val = line.split(":", 1)
                    meta[key.strip()] = val.strip()

    return {"meta": meta, "body": body}

def chunk_markdown_text(doc_meta: Dict[str, Any], text: str, max_chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
    """Splits text into coherent chunks based on headings and paragraphs."""
    sections = re.split(r'\n(?=#{1,3}\s)', text)
    chunks: List[Dict[str, Any]] = []

    for section in sections:
        section = section.strip()
        if not section:
            continue
        
        words = section.split()
        if len(words) <= max_chunk_size:
            chunks.append({
                "title": doc_meta.get("title", ""),
                "publisher": doc_meta.get("publisher", ""),
                "source_url": doc_meta.get("source_url", ""),
                "category": doc_meta.get("category", ""),
                "text": section
            })
        else:
            # Sub-split long sections with word overlap
            start = 0
            while start < len(words):
                end = min(start + max_chunk_size, len(words))
                sub_text = " ".join(words[start:end])
                chunks.append({
                    "title": doc_meta.get("title", ""),
                    "publisher": doc_meta.get("publisher", ""),
                    "source_url": doc_meta.get("source_url", ""),
                    "category": doc_meta.get("category", ""),
                    "text": sub_text
                })
                start += (max_chunk_size - overlap)

    return chunks

def run_ingestion():
    print(f"[SafeSignal Ingest] Scanning documents from: {DOCUMENTS_DIR}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_chunks: List[Dict[str, Any]] = []
    doc_files = list(DOCUMENTS_DIR.glob("*.md"))

    if not doc_files:
        print("[SafeSignal Ingest] No markdown documents found!")
        return

    for doc_file in doc_files:
        parsed = parse_markdown_with_frontmatter(doc_file)
        chunks = chunk_markdown_text(parsed["meta"], parsed["body"])
        all_chunks.extend(chunks)
        print(f"  Processed {doc_file.name}: {len(chunks)} chunks created.")

    print(f"[SafeSignal Ingest] Total chunks extracted: {len(all_chunks)}")

    # Save chunks metadata JSON (used both by FAISS index and fallback retriever)
    metadata_path = OUTPUT_DIR / "chunks_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)
    print(f"[SafeSignal Ingest] Metadata written to {metadata_path}")

    # Build FAISS vector index if sentence-transformers and faiss are available
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        import numpy as np

        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        print(f"[SafeSignal Ingest] Loading embedding model: {model_name}...")
        embedder = SentenceTransformer(model_name)

        texts = [c["text"] for c in all_chunks]
        print(f"[SafeSignal Ingest] Generating embeddings for {len(texts)} chunks...")
        embeddings = embedder.encode(texts, convert_to_numpy=True, normalize_embeddings=True)

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)  # Inner Product on normalized vectors = Cosine Similarity
        index.add(embeddings.astype(np.float32))

        faiss_file_path = OUTPUT_DIR / "index.faiss"
        faiss.write_index(index, str(faiss_file_path))
        print(f"[SafeSignal Ingest] FAISS vector index successfully saved to: {faiss_file_path}")
    except ImportError as e:
        print(f"[SafeSignal Ingest] Notice: sentence-transformers or faiss-cpu not installed in current environment ({e}).")
        print("[SafeSignal Ingest] Chunks metadata JSON is saved and the built-in fallback semantic-keyword retriever is active.")

if __name__ == "__main__":
    run_ingestion()
