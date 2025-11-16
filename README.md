# AI Wiki Quiz Generator

Hey! This is a fun project that takes any Wikipedia article and automatically creates a quiz from it using AI. Pretty cool, right?

## What Does It Do?

Imagine you're reading about Python programming or Albert Einstein on Wikipedia, and you want to test your knowledge. Just paste the Wikipedia link, click a button, and boom - you get a complete quiz with questions, multiple choice answers, and explanations!

The AI reads through the entire article and creates smart questions that actually make sense. It's like having a teacher who reads Wikipedia and makes quizzes for you.

## Features

- **Generate Quizzes**: Paste any Wikipedia URL and get 6-10 questions instantly
- **Smart Questions**: The AI creates questions at different difficulty levels (easy, medium, hard)
- **Complete Answers**: Every question comes with the correct answer and an explanation
- **Save History**: All your generated quizzes are saved, so you can come back to them later
- **Clean Interface**: Simple, beautiful design that's easy to use
- **Related Topics**: Get suggestions for related Wikipedia articles to explore next

## What's Inside?

### Backend (The Brain)
- **FastAPI**: A modern Python web framework that handles all the API requests
- **BeautifulSoup**: Scrapes and cleans the Wikipedia articles
- **Gemini AI**: Google's AI that reads the article and creates the quiz
- **SQLite Database**: Stores all your generated quizzes

### Frontend (The Face)
- **React with TypeScript**: Makes the website interactive and fast
- **Tailwind CSS**: Makes everything look nice and modern
- **Two Main Sections**: 
  - Generate new quizzes
  - View all your past quizzes

## How to Set It Up

### What You Need First
- Python 3.10 or newer
- Node.js and npm
- A Gemini API key (it's free! Get it from Google AI Studio)

### Step 1: Get the Code
Download or clone this project to your computer.

### Step 2: Set Up the Backend

Open your terminal and go to the backend folder:
```
cd backend
```

Create a virtual environment (this keeps everything organized):
```
python -m venv venv
```

Activate it:
- On Windows: `venv\Scripts\activate`
- On Mac/Linux: `source venv/bin/activate`

Install all the Python stuff we need:
```
pip install fastapi uvicorn sqlalchemy beautifulsoup4 requests pydantic langchain-core langchain-community python-dotenv langchain-google-genai
```

Create a file called `.env` and add your API key:
```
GEMINI_API_KEY=your_api_key_here
```

### Step 3: Set Up the Frontend

Open a new terminal window and go to the frontend folder:
```
cd frontend
```

Install everything:
```
npm install
```

### Step 4: Run Everything

**Start the Backend** (in the backend folder):
```
uvicorn main:app --reload
```
This starts the server at http://127.0.0.1:8000

**Start the Frontend** (in the frontend folder, in a different terminal):
```
npm run dev
```
This starts the website at http://localhost:5173

Now open your browser and go to http://localhost:5173 - you're ready to go!

## How to Use It

### Creating a Quiz
1. Go to the "Generate Quiz" tab
2. Paste a Wikipedia URL (like https://en.wikipedia.org/wiki/Python_(programming_language))
3. Click "Generate Quiz"
4. Wait about 15-30 seconds while the AI works its magic
5. Your quiz appears! You can click "Show Answer" on each question to see if you were right

### Viewing Past Quizzes
1. Click the "History" tab
2. You'll see a table of all the quizzes you've made
3. Click "Details" on any quiz to see it again

## API Endpoints (For Developers)

If you want to use the API directly:

**Generate a Quiz:**
```
POST http://127.0.0.1:8000/generate_quiz
Body: {"url": "https://en.wikipedia.org/wiki/Something"}
```

**Get All Quizzes:**
```
GET http://127.0.0.1:8000/history
```

**Get One Quiz:**
```
GET http://127.0.0.1:8000/quiz/1
```

## Project Structure

```
ai-quiz-generator/
├── backend/
│   ├── main.py              (API endpoints)
│   ├── database.py          (Database setup)
│   ├── scraper.py           (Wikipedia scraper)
│   ├── quiz_generator.py   (AI quiz generation)
│   └── .env                 (Your API key - don't share this!)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx          (Main app)
│   │   ├── main.tsx         (Entry point)
│   │   └── index.css        (Styles)
│   └── package.json
│
└── sample_data/
    ├── example_urls.txt     (URLs we tested)
    └── sample_output_*.json (Example API responses)
```

## Tips and Tricks

- **Longer articles = better quizzes**: Articles with more content give the AI more to work with
- **Be patient**: Generation takes 15-30 seconds depending on article length
- **Try different topics**: The AI works well on any topic - history, science, people, places, etc.
- **Check your API key**: If nothing works, make sure your Gemini API key is correct in the `.env` file

## Common Issues

**"Failed to generate quiz"**: Check if your backend is running and your API key is valid

**"Invalid Wikipedia URL"**: Make sure you're using URLs that start with https://en.wikipedia.org/wiki/

**Blank page**: Try refreshing your browser (Ctrl+Shift+R to hard refresh)

**React errors**: Make sure you ran `npm install` in the frontend folder

## Technologies Used

- Python 3.10+
- FastAPI
- React 19
- TypeScript
- Tailwind CSS
- Google Gemini AI
- SQLite
- BeautifulSoup4
- LangChain

## Future Ideas

Some cool things that could be added:
- Take the quiz interactively and get a score
- Support for multiple languages
- Export quizzes as PDF
- Share quizzes with friends
- Add images from the Wikipedia article

## Notes

This project was built for the DeepKlarity Technologies assignment. It uses SQLite instead of MySQL/PostgreSQL for simplicity, but the database can be easily swapped if needed.

The AI generates questions based on the article content, so the quality depends on how well-written the Wikipedia article is. Most articles work great!

## Questions?

If something doesn't work, check:
1. Is the backend running? (http://127.0.0.1:8000)
2. Is the frontend running? (http://localhost:5173)
3. Is your API key valid?
4. Did you install all dependencies?

That's it! Have fun making quizzes! 🎉