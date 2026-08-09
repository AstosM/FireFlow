from pydantic import BaseModel, EmailStr
from datetime import datetime
class PasswordRequest(BaseModel):
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True


class FileResponse(BaseModel):
    share_code: str
    download_url: str
    expires_at: datetime

    class Config:
        from_attributes = True


class FileInfo(BaseModel):
    original_filename: str
    file_size: int
    mime_type: str
    created_at: datetime
    expires_at: datetime
    download_count: int
    max_downloads: int
    one_time: bool

    class Config:
        from_attributes = True