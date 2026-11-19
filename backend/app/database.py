import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://todo:todo@localhost:5432/tododb",
)

# pool_pre_ping checks that a connection is still alive before using it
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """Give each request its own database session, then close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Columns added after the first version of the app.
# create_all() does not change a table that already exists, so we add them here.
NEW_TODO_COLUMNS = {
    "priority": "VARCHAR(10) NOT NULL DEFAULT 'medium'",
    "category": "VARCHAR(50)",
    "due_date": "DATE",
}


def add_missing_columns() -> None:
    """Small safe migration: keeps old data when the table is from an older version."""
    inspector = inspect(engine)
    if "todos" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("todos")}
    with engine.begin() as conn:
        for name, ddl in NEW_TODO_COLUMNS.items():
            if name not in existing:
                conn.execute(text(f"ALTER TABLE todos ADD COLUMN {name} {ddl}"))
