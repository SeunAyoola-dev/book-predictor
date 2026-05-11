from sqlalchemy import Column, Integer, String, Float

from database import Base


class BookDB(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    author = Column(String)
    genre = Column(String, nullable=True)
    rating = Column(String) # Can be numeric or text from scraping
    totalPages = Column(Integer)
    currentPage = Column(Integer, default=0)
    status = Column(String)
    startTime = Column(Float) # Timestamp
    endTime = Column(Float, nullable=True)
    userRating = Column(Integer, nullable=True)
    description = Column(String, nullable=True)