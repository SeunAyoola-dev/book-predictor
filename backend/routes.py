from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import and_
from sqlalchemy.orm import Session

from schemas import BookItem
from database import get_db
from models import BookDB
from predictor import predict

router = APIRouter()

class BookPayload(BaseModel):
    book: BookItem

@router.post("/prediction")
def return_prediction(payload: BookPayload):
    book = payload.book
    return predict(book)

@router.post("/book")
def add_book(payload: BookPayload, db: Session = Depends(get_db)):
    book = payload.book
    added = False
    existing_book = db.query(BookDB).filter(
        and_(
            BookDB.title.ilike(book.title),
            BookDB.author.ilike(book.author)
        )
    ).first()
    print("book", book)
    print("existing_book", existing_book)
    if not existing_book:
        db.add(BookDB(**book.model_dump()))
        db.commit()
        added = True

    return {
        "added": added
    }
