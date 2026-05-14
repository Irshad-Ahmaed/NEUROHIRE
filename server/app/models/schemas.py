import uuid
import enum
from typing import List, Optional
from datetime import datetime
from app.extensions import Base
from sqlalchemy import func, Uuid, String, DateTime, ForeignKey, Text, Float, Integer, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

class SessionStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(225), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(225), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    resumes: Mapped[List["Resume"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sessions: Mapped[List["InterviewSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"

class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    parsed_skills: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="resumes")
    sessions: Mapped[List["InterviewSession"]] = relationship(back_populates="resume")

    def __repr__(self):
        return f"<Resume {self.id}>"

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    resume_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("resumes.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(225), nullable=False)
    experience: Mapped[str] = mapped_column(String(50), nullable=True)
    status: Mapped[SessionStatus] = mapped_column(SAEnum(SessionStatus), default=SessionStatus.ACTIVE)
    final_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="sessions")
    resume: Mapped["Resume"] = relationship(back_populates="sessions")
    turns: Mapped[List["InterviewTurn"]] = relationship(back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InterviewSession {self.id} - {self.role}>"

class InterviewTurn(Base):
    __tablename__ = "interview_turns"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("interview_sessions.id"), nullable=False)
    turn_number: Mapped[int] = mapped_column(Integer, nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retrieved_context: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON: [{text, book, chunk_index}]
    ai_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)        # JSON: {score, feedback, next_difficulty}
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    session: Mapped["InterviewSession"] = relationship(back_populates="turns")

    def __repr__(self):
        return f"<InterviewTurn {self.session_id} - Turn {self.turn_number}>"

class Report(Base):
    """Deprecated: Kept for backward compatibility with older version of the app."""
    __tablename__ = 'reports'

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    resume_text: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(String(225), nullable=True)
    experience: Mapped[str] = mapped_column(String(50), nullable=True)
    result: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship
    user: Mapped["User"] = relationship(back_populates="reports")

    def __repr__(self):
        return f"<Report {self.id}>"
