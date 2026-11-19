import os
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, add_missing_columns, engine, get_db


def prepare_database(retries: int = 15, delay: float = 2.0) -> None:
    """The database container may still be starting, so try a few times."""
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            add_missing_columns()
            return
        except OperationalError:
            print(f"Database not ready (try {attempt}/{retries}), waiting...")
            time.sleep(delay)
    raise RuntimeError("Could not connect to the database")


@asynccontextmanager
async def lifespan(app: FastAPI):
    prepare_database()
    yield


app = FastAPI(title="Todo API", version="2.0.0", lifespan=lifespan)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------------------- Todos ----------------------------
def find_todo(db: Session, todo_id: int) -> models.Todo:
    todo = db.get(models.Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@app.get("/api/todos", response_model=list[schemas.TodoOut])
def list_todos(db: Session = Depends(get_db)):
    return db.scalars(select(models.Todo).order_by(models.Todo.id)).all()


@app.post("/api/todos", response_model=schemas.TodoOut, status_code=status.HTTP_201_CREATED)
def create_todo(payload: schemas.TodoCreate, db: Session = Depends(get_db)):
    todo = models.Todo(**payload.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.get("/api/todos/{todo_id}", response_model=schemas.TodoOut)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    return find_todo(db, todo_id)


@app.put("/api/todos/{todo_id}", response_model=schemas.TodoOut)
def update_todo(todo_id: int, payload: schemas.TodoUpdate, db: Session = Depends(get_db)):
    todo = find_todo(db, todo_id)
    # exclude_unset: only change fields the client actually sent
    for field, value in payload.model_dump(exclude_unset=True).items():
        # category and due_date may be cleared with null; the others may not
        if value is None and field not in ("category", "due_date"):
            continue
        setattr(todo, field, value)
    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/api/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = find_todo(db, todo_id)
    db.delete(todo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------------------------- Profile ----------------------------
def get_or_create_profile(db: Session) -> models.Profile:
    profile = db.get(models.Profile, 1)
    if profile is None:
        profile = models.Profile(id=1)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@app.get("/api/profile", response_model=schemas.ProfileOut)
def get_profile(db: Session = Depends(get_db)):
    return get_or_create_profile(db)


@app.put("/api/profile", response_model=schemas.ProfileOut)
def update_profile(payload: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is None and field != "email":
            continue
        setattr(profile, field, value or "")
    db.commit()
    db.refresh(profile)
    return profile
