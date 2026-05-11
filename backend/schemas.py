from typing import List, Optional
from pydantic import BaseModel

class BookItem(BaseModel):
    id: str
    title: str
    author: Optional[str] = None
    genre: Optional[str] = None
    rating: Optional[str] = None
    totalPages: Optional[int] = None
    currentPage: Optional[int] = 0
    status: Optional[str] = "reading"
    startTime: Optional[float] = None
    endTime: Optional[float] = None
    userRating: Optional[int] = None
    description: Optional[str] = None