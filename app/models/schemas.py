from pydantic import BaseModel


class TranslationRequest(BaseModel):
    text: str  # Text to translate
    target_language: str = (
        "uk"  # Default to Ukrainian, can be changed to any language code
    )


class TranslationResponse(BaseModel):
    original: str
    translated: str


class VideoRequest(BaseModel):
    video_url: str


class ErrorResponse(BaseModel):
    error: str
