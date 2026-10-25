import pytest
from rag.retriever import safety_retriever
from app.services.gemini_service import gemini_assistant

def test_knowledge_base_loading():
    # Verify that RAG knowledge base loads and has chunks
    assert len(safety_retriever.chunks) > 0, "Expected knowledge chunks to be indexed"

def test_retriever_query_hacked_account():
    results = safety_retriever.retrieve("What should I do if my social media account is hacked?", top_k=2)
    assert len(results) > 0
    # Top result should mention account recovery or Instagram / Google
    top_chunk_text = results[0]["text"].lower()
    assert any(term in top_chunk_text for term in ["hack", "recovery", "account", "instagram"])

def test_retriever_query_cybercrime_india():
    results = safety_retriever.retrieve("Where can I report cybercrime in India?", top_k=2)
    assert len(results) > 0
    top_urls = [r["source_url"] for r in results]
    assert any("cybercrime.gov.in" in u for u in top_urls)

def test_immediate_physical_threat_detector():
    assert gemini_assistant.is_immediate_physical_threat("Someone is following me right now") is True
    assert gemini_assistant.is_immediate_physical_threat("I need help, emergency danger outside") is True
    assert gemini_assistant.is_immediate_physical_threat("How do I change my Instagram password?") is False
