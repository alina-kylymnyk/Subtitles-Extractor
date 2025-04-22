from fastapi import HTTPException
from googletrans import Translator, LANGUAGES


class TranslationService:
    def __init__(self):
        self.translator = Translator()

    def translate(
        self, text: str, source_language: str = "en", target_language: str = "uk"
    ) -> dict:
        """
        Translate text from the specified source language to the target language.

        Args:
            text: Text to translate
            source_language: Language code for the source language (default is English 'en')
            target_language: Language code for the target language (default is Ukrainian 'uk')

        Returns:
            dict: Dictionary with original and translated text
        """
        try:
            if not text.strip():
                raise HTTPException(
                    status_code=400, detail="Input text cannot be empty."
                )

            # Check text length
            if len(text) > 5000:
                raise HTTPException(
                    status_code=400,
                    detail="Please, try to enter fewer words - the translator limits are 5000 characters.",
                )

            # Check if source language code is valid
            if source_language not in LANGUAGES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Source language '{source_language}' is not supported.",
                )

            # Check if target language code is valid
            if target_language not in LANGUAGES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Target language '{target_language}' is not supported.",
                )

            translation = self.translator.translate(
                text, src=source_language, dest=target_language
            )

            if not translation or not translation.text:
                raise HTTPException(status_code=500, detail="Translation failed.")

            return {"original": text, "translated": translation.text}

        except TypeError as e:
            # Specific handling for the NoneType error
            if "NoneType" in str(e):
                raise HTTPException(
                    status_code=400,
                    detail="Please, try to enter fewer words - the translator limits are 5000 characters.",
                )
            raise HTTPException(status_code=500, detail=f"Error translating text: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error translating text: {e}")
