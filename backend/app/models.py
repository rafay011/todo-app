from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # low / medium / high
    priority: Mapped[str] = mapped_column(
        String(10), default="medium", server_default="medium", nullable=False
    )
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Profile(Base):
    """One row (id=1). This app has no login, so there is a single profile."""

    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), default="Guest", nullable=False)
    email: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    theme: Mapped[str] = mapped_column(String(10), default="system", nullable=False)
    accent: Mapped[str] = mapped_column(String(10), default="indigo", nullable=False)
