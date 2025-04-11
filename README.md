# Subtitles Extractor with Translator and Notes

An application that allows users to extract subtitles from YouTube videos, translate English text to Ukrainian, and save new vocabulary for later reference. It integrates several features for enhancing language learning with notes and tasks.

## Features

- YouTube subtitle extraction
- English to Ukrainian translation
- Vocabulary management for language learning
- Notes and tasks system for tracking progress
- Web-based interface

## Installation and Setup

### Standard Method

1. Clone the repository:
   ```bash
   git clone https://github.com/alina-kylymnyk/subtitles-extractor.git
   cd subtitles-extractor
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # For Windows
   .\venv\Scripts\activate
   # For macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python app/main.py
   ```

5. Access the application in your browser:
   ```
   http://localhost:8000
   ```

### Using Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/alina-kylymnyk/subtitles-extractor.git
   cd subtitles-extractor
   ```

2. Build the Docker image:
   ```bash
   docker build -t subtitles-extractor .
   ```

3. Run the Docker container:
   ```bash
   docker run -p 8000:8000 subtitles-extractor
   ```

4. Access the application in your browser:
   ```
   http://localhost:8000
   ```
