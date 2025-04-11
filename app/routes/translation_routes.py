from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.translation_service import TranslationService

router = APIRouter()


# Update schema to match the frontend request parameters
class TranslationRequest(BaseModel):
    text: str
    source_lang: str  # Added to match frontend
    target_lang: str  # Changed from target_language to match frontend


class TranslationResponse(BaseModel):
    translated: str
    original: str


def get_translation_service():
    return TranslationService()


@router.post("/translate/", response_model=TranslationResponse)
async def translate_api(
    request: TranslationRequest,
    translation_service: TranslationService = Depends(get_translation_service),
):
    # Use the translate method with parameters from the request
    result = translation_service.translate(
        request.text,
        source_language=request.source_lang,
        target_language=request.target_lang,
    )

    # If your translation service returns a dictionary with 'original' and 'translated' keys
    if isinstance(result, dict) and "original" in result and "translated" in result:
        return {"original": result["original"], "translated": result["translated"]}
    # If your translation service just returns the translated text as a string
    elif isinstance(result, str):
        return {"original": request.text, "translated": result}
    # If result is something else unexpected
    else:
        return {"original": request.text, "translated": str(result) if result else ""}
