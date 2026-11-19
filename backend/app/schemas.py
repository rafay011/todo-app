from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Priority = Literal["low", "medium", "high"]
Theme = Literal["light", "dark", "system"]
Accent = Literal["indigo", "emerald", "rose", "amber", "sky"]


class StrippedModel(BaseModel):
    # Remove spaces at the start and end of every text field
    model_config = ConfigDict(str_strip_whitespace=True)


# ---------- Todos ----------
class TodoCreate(StrippedModel):
    title: str = Field(min_length=1, max_length=200)
    priority: Priority = "medium"
    category: str | None = Field(default=None, max_length=50)
    due_date: date | None = None

    @field_validator("category")
    @classmethod
    def empty_category_is_none(cls, v):
        return v or None


class TodoUpdate(StrippedModel):
    # Every field is optional, so the client sends only what changed
    title: str | None = Field(default=None, min_length=1, max_length=200)
    completed: bool | None = None
    priority: Priority | None = None
    category: str | None = Field(default=None, max_length=50)
    due_date: date | None = None

    @field_validator("category")
    @classmethod
    def empty_category_is_none(cls, v):
        return v or None


class TodoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    completed: bool
    priority: Priority
    category: str | None
    due_date: date | None
    created_at: datetime


# ---------- Profile ----------
class ProfileUpdate(StrippedModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    email: str | None = Field(default=None, max_length=120)
    theme: Theme | None = None
    accent: Accent | None = None


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    email: str
    theme: Theme
    accent: Accent
