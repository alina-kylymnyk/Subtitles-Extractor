import re
import os
import tempfile
import requests
import yt_dlp


class SubtitleService:
    @staticmethod
    def get_available_languages(video_url: str) -> tuple[dict, str]:
        """
        Get available subtitle languages for a YouTube video URL.

        Args:
            video_url: URL of the YouTube video

        Returns:
            tuple: (languages_dict, error_message)
                languages_dict: Dictionary with language codes as keys and language names as values
                error_message: Error message if any
        """
        try:
            ydl_opts = {
                "listsubtitles": True,
                "skip_download": True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)

            available_subtitles = info.get("subtitles", {})

            if not available_subtitles:
                return {}, "No subtitles are available for this video."

            # Language codes mapping (this is a simplified version, could be expanded)
            language_names = {
                "en": "English",
                "es": "Spanish",
                "fr": "French",
                "de": "German",
                "it": "Italian",
                "pt": "Portuguese",
                "ru": "Russian",
                "ja": "Japanese",
                "ko": "Korean",
                "zh": "Chinese",
                "ar": "Arabic",
                "hi": "Hindi",
                # Add more language codes as needed
            }

            # Create a dictionary of available languages with their names
            languages_dict = {}
            for lang_code in available_subtitles.keys():
                languages_dict[lang_code] = language_names.get(
                    lang_code, lang_code.upper()
                )

            return languages_dict, None

        except yt_dlp.DownloadError as e:
            return (
                {},
                f"An error occurred while extracting video info: {str(e)}. Please check the video URL.",
            )
        except Exception as e:
            return (
                {},
                f"An unexpected error occurred: {str(e)}. Please try again later.",
            )

    @staticmethod
    def extract_subtitles(video_url: str, language_code: str = "en") -> tuple[str, str]:
        """
        Extract subtitles from a YouTube video URL in the specified language.

        Args:
            video_url: URL of the YouTube video
            language_code: Language code for subtitles (default: "en" for English)

        Returns:
            tuple: (subtitle_text, error_message)
        """
        try:
            ydl_opts = {
                "writesubtitles": True,
                "subtitleslangs": [language_code],
                "skip_download": True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)

            subtitles = info.get("subtitles", {}).get(language_code, [])
            if not subtitles:
                return (
                    None,
                    f"No subtitles in {language_code} are available for this video. Please try another language.",
                )

            subtitle_url = subtitles[0]["url"]
            response = requests.get(subtitle_url)
            if response.status_code != 200:
                return (
                    None,
                    f"Failed to retrieve subtitles (HTTP {response.status_code}). Please try again later.",
                )

            subtitle_data = response.json()
            text_lines = []
            for event in subtitle_data.get("events", []):
                for segment in event.get("segs", []):
                    text = segment.get("utf8", "").strip()
                    if text:
                        text_lines.append(text)

            subtitle_text = " ".join(text_lines)
            subtitle_text = re.sub(
                r"Transcriber:.*?\n|Reviewer:.*?\n", "", subtitle_text
            )
            subtitle_text = re.sub(r"\n", " ", subtitle_text)
            subtitle_text = re.sub(r"\s{2,}", " ", subtitle_text)

            return (
                subtitle_text.strip(),
                None,
            )

        except yt_dlp.DownloadError as e:
            return (
                None,
                f"An error occurred while extracting the video info: {str(e)}. Please check the video URL and try again.",
            )

        except requests.exceptions.RequestException as e:
            return (
                None,
                f"An issue occurred while retrieving the subtitle file: {str(e)}. Please check your internet connection and try again.",
            )

        except KeyError as e:
            return (
                None,
                f"Unexpected response format while processing subtitles. It seems like some data is missing or corrupted: {str(e)}.",
            )

        except Exception as e:
            return (
                None,
                f"An unexpected error occurred: {str(e)}. Please try again later or contact support.",
            )

    @staticmethod
    def create_subtitles_file(
        subtitle_text: str, video_url: str, language_code: str = "en"
    ) -> tuple[str, str]:
        """
        Create a temporary subtitle file and return its path

        Args:
            subtitle_text: The subtitle text content
            video_url: Original video URL for naming
            language_code: Language code for naming the file

        Returns:
            tuple: (file_path, filename)
        """
        # Create a temporary file
        fd, path = tempfile.mkstemp(suffix=".txt")
        with os.fdopen(fd, "w") as tmp:
            tmp.write(subtitle_text)

        # Extract video ID or use a default name
        video_id = (
            video_url.split("v=")[-1].split("&")[0]
            if "v=" in video_url
            else "subtitles"
        )
        filename = f"{video_id}_{language_code}_subtitles.txt"

        return path, filename

    @staticmethod
    def get_video_title(video_url: str) -> str:
        """
        Get the title of a YouTube video from its URL.

        Args:
            video_url: YouTube video URL or ID

        Returns:
            str: Video title

        Raises:
            Exception: If an error occurs while fetching the video title
        """
        try:
            # Check if the input is a full URL or just a video ID
            if "youtube.com" in video_url or "youtu.be" in video_url:
                # It's already a URL, use it directly
                url_to_use = video_url

                # Extract video ID for fallback title if needed
                if "v=" in video_url:
                    video_id = video_url.split("v=")[-1].split("&")[0]
                elif "youtu.be/" in video_url:
                    video_id = video_url.split("youtu.be/")[-1].split("?")[0]
                else:
                    video_id = "unknown"
            else:
                # Assume it's just a video ID, construct the URL
                video_id = video_url
                url_to_use = f"https://www.youtube.com/watch?v={video_id}"

            # Use yt-dlp to get video info including title
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "skip_download": True,
                "extract_flat": True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url_to_use, download=False)

            # Return the video title
            video_title = info.get("title", f"YouTube Video ({video_id})")
            return video_title

        except yt_dlp.DownloadError as e:
            # Handle YouTube-specific errors
            error_message = str(e)
            if "Private video" in error_message:
                return f"Private YouTube Video ({video_id})"
            elif "This video is unavailable" in error_message:
                return f"Unavailable YouTube Video ({video_id})"
            else:
                # Return a generic title with the video ID
                return f"YouTube Video ({video_id})"
        except Exception as e:
            # For any other errors, return a generic title
            return f"YouTube Video ({video_id})"
