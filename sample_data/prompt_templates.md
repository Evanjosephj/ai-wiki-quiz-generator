# LangChain Prompt Templates Documentation

## Overview
This document explains the AI prompts used in the AI Wiki Quiz Generator to create intelligent quizzes from Wikipedia articles.

## Main Quiz Generation Prompt

### Purpose
Generate a structured quiz with multiple-choice questions, explanations, and metadata from Wikipedia article content.

### Prompt Template

```
Create a quiz from this Wikipedia article. Return ONLY valid JSON.

Title: {article_title}
Content: {article_content}

Return this exact structure:
{
  "title": "{article_title}",
  "summary": "2-3 sentence summary",
  "key_entities": {
    "people": [],
    "organizations": [],
    "locations": []
  },
  "sections": ["section1", "section2"],
  "quiz": [
    {
      "question": "text",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "difficulty": "easy",
      "explanation": "why"
    }
  ],
  "related_topics": ["topic1", "topic2"]
}

Create 5-7 questions. Return ONLY JSON, no markdown.
```

### Prompt Components

1. **Title Injection**: `{article_title}` - The Wikipedia article title for context
2. **Content Injection**: `{article_content}` - The scraped article text (limited to 8000 characters for API efficiency)
3. **Structured Output Request**: Explicitly asks for JSON format to ensure parseable responses
4. **Schema Definition**: Provides exact JSON structure expected in the response

### Prompt Engineering Techniques Used

#### 1. **Clear Output Format**
- Explicitly states "Return ONLY valid JSON"
- Provides exact JSON structure template
- Prevents AI from adding explanatory text or markdown formatting

#### 2. **Grounding in Source Material**
- Includes actual article content in the prompt
- References article title twice for context
- Ensures questions are based on provided text, minimizing hallucinations

#### 3. **Structured Data Extraction**
- Requests specific entity types (people, organizations, locations)
- Asks for article sections to be identified
- Generates related topics for further exploration

#### 4. **Question Quality Guidelines**
- Specifies 5-7 questions for consistent output
- Requires difficulty levels (easy/medium/hard)
- Demands explanations for each answer to ensure educational value

#### 5. **Multiple Choice Format**
- Four options (A-D) standard format
- Clear answer designation
- Options must be distinct and plausible

### Content Preprocessing

Before sending to the AI:
- Article content is limited to 8000 characters to stay within API token limits
- HTML is stripped and cleaned by BeautifulSoup
- Boilerplate Wikipedia elements (references, navigation) are removed

### Response Processing

After receiving AI response:
1. **Markdown Removal**: Strip any ```json``` code fences the AI might add
2. **JSON Parsing**: Convert string response to Python dictionary
3. **Validation**: Ensure all required fields are present
4. **Error Handling**: Catch and log any parsing failures

## Prompt Optimization Strategies

### Why This Prompt Works Well

1. **Specificity**: Tells the AI exactly what format to return
2. **Examples**: Provides a template showing the expected structure
3. **Constraints**: Limits question count and enforces difficulty levels
4. **Grounding**: Uses actual article content to prevent making up facts
5. **Simplicity**: Clear, direct instructions without ambiguity

### Minimizing Hallucinations

- Content is provided directly in the prompt (grounding)
- Questions must reference provided text
- Explanations are required, forcing the AI to cite its reasoning
- Limited to article content only (no external knowledge encouraged)

### Handling Edge Cases

- **Long articles**: Content truncated to 8000 chars
- **Short articles**: AI generates fewer but quality questions
- **Markdown in response**: Stripped automatically
- **Malformed JSON**: Caught and logged as error

## API Configuration

- **Model**: Gemini 2.5 Flash (Google's latest fast model)
- **Endpoint**: Google Generative Language API
- **Timeout**: 60 seconds (allows time for longer articles)
- **Content Limit**: 8000 characters (balances quality vs API limits)

## Future Improvements

Potential enhancements to consider:

1. **Dynamic Question Count**: Adjust based on article length
2. **Section-Based Questions**: Group questions by article sections
3. **Difficulty Distribution**: Ensure mix of easy/medium/hard questions
4. **Answer Variety**: Ensure all options (A/B/C/D) are used as answers
5. **Multi-Turn Refinement**: Ask AI to improve unclear questions
6. **Fact Verification**: Cross-check answers against source material

## Example Output

Here's what the AI returns for a Python programming article:

```json
{
  "title": "Python (programming language)",
  "summary": "Python is a high-level, general-purpose programming language...",
  "key_entities": {
    "people": ["Guido van Rossum", "Tim Peters"],
    "organizations": ["Python Software Foundation"],
    "locations": ["Netherlands"]
  },
  "sections": ["History", "Design Philosophy", "Syntax"],
  "quiz": [
    {
      "question": "Who created Python?",
      "options": ["A. Guido van Rossum", "B. Tim Peters", "C. Dennis Ritchie", "D. Bjarne Stroustrup"],
      "answer": "A",
      "difficulty": "easy",
      "explanation": "Guido van Rossum began working on Python in the late 1980s."
    }
  ],
  "related_topics": ["Programming Languages", "Object-Oriented Programming"]
}
```

## Notes

- This prompt emphasizes structured output over conversational responses
- JSON format ensures easy integration with frontend and database
- The approach prioritizes accuracy and educational value over quantity
- All questions are grounded in the provided article content