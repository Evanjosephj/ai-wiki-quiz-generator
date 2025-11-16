import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def generate_quiz(title, content):
    try:
        limited_content = content[:8000]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        prompt = f"""Create a quiz from this Wikipedia article. Return ONLY valid JSON.

Title: {title}
Content: {limited_content}

Return this exact structure:
{{
  "title": "{title}",
  "summary": "2-3 sentence summary",
  "key_entities": {{"people": [], "organizations": [], "locations": []}},
  "sections": ["section1", "section2"],
  "quiz": [
    {{"question": "text", "options": ["A", "B", "C", "D"], "answer": "A", "difficulty": "easy", "explanation": "why"}}
  ],
  "related_topics": ["topic1", "topic2"]
}}

Create 5-7 questions. Return ONLY JSON, no markdown."""

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }

        print("Calling Gemini API...")
        response = requests.post(url, json=payload, timeout=60)

        if response.status_code != 200:
            print(f"API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return None

        result = response.json()
        text = result['candidates'][0]['content']['parts'][0]['text']
        text = text.strip()

        if '```json' in text:
            text = text.split('```json')[1].split('```')[0]
        elif '```' in text:
            text = text.split('```')[1].split('```')[0]

        quiz_data = json.loads(text.strip())
        print("Quiz generated successfully!")
        return quiz_data

    except Exception as e:
        print(f"Quiz generation error: {e}")
        return None