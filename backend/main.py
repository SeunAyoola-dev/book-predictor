from fastapi import FastAPI
from database import Base, engine
from routes import router
import uvicorn



Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
