from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Boolean
)

from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):

    __tablename__ = "users"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    username = Column(
        String,
        unique=True,
        nullable=False
    )


    email = Column(
        String,
        unique=True,
        nullable=False
    )


    hashed_password = Column(
        String,
        nullable=False
    )

    plan = Column(
    String,
    default="free",
    nullable=False
)

    files = relationship(
        "File",
        back_populates="owner"
    )



class File(Base):

    __tablename__ = "files"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    original_filename = Column(
        String,
        nullable=False
    )


    stored_filename = Column(
        String,
        nullable=False
    )


    share_code = Column(
        String,
        unique=True,
        nullable=False
    )


    mime_type = Column(
        String
    )


    file_size = Column(
        Integer
    )


    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    expires_at = Column(
        DateTime,
        nullable=False
    )


    max_downloads = Column(
        Integer,
        default=3
    )


    download_count = Column(
        Integer,
        default=0
    )


    one_time = Column(
        Boolean,
        default=False
    )


    password = Column(
        String,
        nullable=True
    )


    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )


    owner = relationship(
        "User",
        back_populates="files"
    )