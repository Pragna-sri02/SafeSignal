from fastapi import APIRouter, HTTPException, status
from app.models.schemas import AssistantChatRequest, AssistantChatResponse
from app.services.gemini_service import gemini_assistant

router = APIRouter(prefix="/api/assistant", tags=["AI Safety Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(payload: AssistantChatRequest):
    """
    Submits user query to the RAG conversational assistant.
    Grounds answers in trusted safety documents and returns verified citations.
    Prioritizes emergency resources if physical danger is detected.
    """
    if len(payload.message.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    try:
        response = await gemini_assistant.generate_response(
            user_message=payload.message,
            conversation_history=payload.conversation_history
        )
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Safety assistant could not process query: {str(exc)}"
        )
