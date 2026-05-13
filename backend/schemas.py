from typing import List, Optional
from pydantic import BaseModel

class BookItem(BaseModel):
    title: str
    author: Optional[str] = None
    genre: Optional[str] = None
    rating: Optional[str] = None
    totalPages: Optional[int] = None
    status: Optional[str] = "reading"