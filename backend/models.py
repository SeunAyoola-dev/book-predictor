from sqlalchemy import Column, Integer, String, Float

from database import Base


class BookDB(Base):
    __tablename__ = "books"

    title = Column(String, primary_key=True)
    author = Column(String, primary_key=True)
    genre = Column(String, nullable=True)
    rating = Column(String) # Can be numeric or text from scraping
    totalPages = Column(Integer)
    status = Column(String)
