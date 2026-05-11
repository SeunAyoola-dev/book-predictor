from fastapi import FastAPI
from typing import List, Dict
from pydantic import BaseModel

app = FastAPI()

class BookPayload(BaseModel):
    book: Dict
    readingHistory: List[Dict]

@app.post("/book")
def return_prediction(payload: BookPayload):
    book = payload.book
    reading_history = payload.readingHistory

    score = 60 if book.get("parsedNumberOfPages") > 500 else 20

    return {
        "score": score,
        "explanation": "Simple heuristic (dev)"
    }