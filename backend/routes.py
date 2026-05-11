from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from schemas import BookItem
from database import get_db
from models import BookDB
from predictor import predict

router = APIRouter()

class BookPayload(BaseModel):
    book: BookItem
    readingHistory: List[BookItem]

@router.post("/book")
def return_prediction(payload: BookPayload, db: Session = Depends(get_db)):
    book_data = payload.book

    db_book = db.query(BookDB).filter(BookDB.id == book_data.id).first()
    if not db_book:
        db_book = BookDB(**book_data.model_dump())
        db.add(db_book)
        db.commit()
    print("here")
    print(f"LOG[INFO]: READING HISTORY IS {payload.readingHistory}")
    for hist_item in payload.readingHistory:
        existing = db.query(BookDB).filter(BookDB.id == hist_item.id).first()
        if not existing:
            db.add(BookDB(**hist_item.model_dump()))
    db.commit()

    return predict(book_data)