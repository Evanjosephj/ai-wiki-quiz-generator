from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from database import get_db, init_db, Quiz
from scraper import scrape_wikipedia
from quiz_generator import generate_quiz

app = FastAPI(title="AI Quiz Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    print("Database initialized!")

class QuizRequest(BaseModel):
    url: str

@app.get("/")
def root():
    return {"message": "AI Quiz Generator API is running!"}

@app.post("/generate_quiz")
def create_quiz(request: QuizRequest, db: Session = Depends(get_db)):
    try:
        if not request.url.startswith("https://en.wikipedia.org/wiki/"):
            raise HTTPException(400, "Invalid Wikipedia URL")
        
        title, content = scrape_wikipedia(request.url)
        
        if not title or not content:
            raise HTTPException(400, "Failed to scrape article")
        
        quiz_data = generate_quiz(title, content)
        
        if not quiz_data:
            raise HTTPException(500, "Failed to generate quiz")
        
        new_quiz = Quiz(
            url=request.url,
            title=title,
            full_quiz_data=json.dumps(quiz_data)
        )
        
        db.add(new_quiz)
        db.commit()
        db.refresh(new_quiz)
        
        return {
            "id": new_quiz.id,
            "url": new_quiz.url,
            "title": new_quiz.title,
            "date_generated": new_quiz.date_generated.isoformat(),
            **quiz_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).order_by(Quiz.date_generated.desc()).all()
    return [
        {
            "id": q.id,
            "url": q.url,
            "title": q.title,
            "date_generated": q.date_generated.isoformat()
        }
        for q in quizzes
    ]

@app.get("/quiz/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    
    quiz_data = json.loads(quiz.full_quiz_data)
    
    return {
        "id": quiz.id,
        "url": quiz.url,
        "title": quiz.title,
        "date_generated": quiz.date_generated.isoformat(),
        **quiz_data
    }