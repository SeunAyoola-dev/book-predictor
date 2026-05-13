from schemas import BookItem

def predict(book: BookItem) -> dict:
    score = 60 if (book.totalPages or 0) > 500 else 20
    return {
        "score": score,
        "explanation": "Simple heuristic (dev) with DB persistence",
    }
