from typing import List
from rag.retriever import safety_retriever
from app.models.schemas import SourceCitationModel

class RAGService:
    """
    RAG service that queries the retriever and converts matches into validated citation models.
    """

    def retrieve_context_and_citations(self, query: str, top_k: int = 4) -> tuple[str, List[SourceCitationModel]]:
        raw_chunks = safety_retriever.retrieve(query, top_k=top_k)

        citations: List[SourceCitationModel] = []
        context_parts = []

        for i, chunk in enumerate(raw_chunks, 1):
            citation = SourceCitationModel(
                title=chunk.get("title", "Safety Document"),
                source_url=chunk.get("source_url", "https://cybercrime.gov.in"),
                publisher=chunk.get("publisher", "Government of India / Safety Authority"),
                snippet=chunk.get("snippet", ""),
                category=chunk.get("category", "safety"),
                relevance_score=chunk.get("relevance_score")
            )
            citations.append(citation)

            # Format for LLM prompt context
            context_parts.append(
                f"[Source {i}]: {citation.title} ({citation.publisher})\n"
                f"URL: {citation.source_url}\n"
                f"Content:\n{chunk.get('text', '')}\n"
            )

        context_str = "\n---\n".join(context_parts)
        return context_str, citations

rag_service = RAGService()
