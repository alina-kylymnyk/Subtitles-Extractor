from fastapi import APIRouter, Request, Form, HTTPException, Body
from fastapi.responses import FileResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import os
from typing import Dict, Any

from app.services.subtitle_service import SubtitleService

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/")
async def index(request: Request):
    """Render the initial page with the form"""
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/check_languages/")
async def check_languages(request: Request, video_url: str = Form(None)):
    """Check available languages for the provided video URL"""
    # Handle form submissions
    if video_url is None:
        # Try to get from JSON body - this handles frontend AJAX requests
        try:
            data = await request.json()
            video_url = data.get("video_url")
        except:
            # If not a JSON request, return error
            return JSONResponse(
                status_code=400, content={"error": "Missing video URL parameter"}
            )

    languages_dict, error_message = SubtitleService.get_available_languages(video_url)

    # Check if this is an AJAX request
    is_ajax = (
        request.headers.get("X-Requested-With") == "XMLHttpRequest"
        or request.headers.get("Accept") == "application/json"
    )

    if error_message:
        if is_ajax:
            return JSONResponse(status_code=400, content={"error": error_message})
        else:
            return templates.TemplateResponse(
                "index.html",
                {
                    "request": request,
                    "error_message": error_message,
                    "video_url": video_url,
                },
            )

    if is_ajax:
        return JSONResponse(content={"languages": languages_dict})
    else:
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "languages": languages_dict,
                "video_url": video_url,
            },
        )


@router.post("/process_video/")
async def process_video(
    request: Request, video_url: str = Form(None), language_code: str = Form(None)
):
    """Process video and extract subtitles in the selected language"""
    # Handle both form and JSON submissions
    if video_url is None or language_code is None:
        try:
            data = await request.json()
            video_url = data.get("video_url")
            language_code = data.get("language_code")
        except:
            return JSONResponse(
                status_code=400, content={"error": "Missing required parameters"}
            )

    subtitle_text, error_message = SubtitleService.extract_subtitles(
        video_url, language_code
    )

    # Check if this is an AJAX request
    is_ajax = (
        request.headers.get("X-Requested-With") == "XMLHttpRequest"
        or request.headers.get("Accept") == "application/json"
    )

    # Get available languages to include in the response
    available_languages, _ = SubtitleService.get_available_languages(video_url)

    # Add more descriptive error messages if there's an issue
    if error_message:
        if is_ajax:
            return JSONResponse(status_code=400, content={"error": error_message})
        else:
            return templates.TemplateResponse(
                "index.html",
                {
                    "request": request,
                    "error_message": error_message,
                    "video_url": video_url,
                    "languages": available_languages,
                },
            )

    if is_ajax:
        return JSONResponse(
            content={
                "subtitle_text": subtitle_text,
                "video_url": video_url,
                "language_code": language_code,
            }
        )
    else:
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "subtitle_text": subtitle_text,
                "video_url": video_url,
                "language_code": language_code,
                "languages": available_languages,  # Include languages in response
            },
        )


@router.post("/download_subtitles/")
async def download_subtitles(
    video_url: str = Form(...), language_code: str = Form("en")
):
    """Download subtitles in the specified language"""
    subtitle_text, error_message = SubtitleService.extract_subtitles(
        video_url, language_code
    )

    # More detailed error handling
    if error_message:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to extract {language_code} subtitles for the video. {error_message}",
        )

    # Create a temporary file for download
    try:
        path, filename = SubtitleService.create_subtitles_file(
            subtitle_text, video_url, language_code
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the subtitle file: {str(e)}. Please try again later.",
        )

    # Return the file as a download
    return FileResponse(
        path,
        media_type="text/plain",
        filename=filename,
        background=lambda: os.remove(path),  # Delete the temporary file after download
    )
