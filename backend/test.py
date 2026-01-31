from fastapi import FastAPI
from typing import List, Dict
from pydantic import BaseModel

app = FastAPI()

class BookPayload(BaseModel):
    book: Dict
    readingHistory: List[Dict]

@app.post("/book")
def returnPrediction(payload: BookPayload):
    book = payload.book
    readingHistory = payload.readingHistory

    score = 0.6 if book.get("parsedNumberOfPages") > 500 else 0.2

    return {
        "score": score,
        "explanation": "Simple heuristic (dev)"
    }