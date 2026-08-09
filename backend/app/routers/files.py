
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
    Form
)

from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from ..database import get_db
from ..models import File as FileModel
from ..plans import PLANS
from ..schemas import PasswordRequest

import os
import uuid
import qrcode

from datetime import datetime, timedelta
load_dotenv()

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)


# =========================================================
# FOLDERS
# =========================================================

UPLOAD_FOLDER = "uploads"
QR_FOLDER = "uploads/qr"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(QR_FOLDER, exist_ok=True)


# =========================================================
# SHARE CODE
# =========================================================

def generate_share_code():
    code = str(uuid.uuid4()).split("-")[0]
    return f"FF-{code.upper()}"


# =========================================================
# EXPIRY
# =========================================================

def calculate_expiry(
    expiry_type,
    custom_days,
    custom_hours,
    custom_minutes
):
    now = datetime.utcnow()

    if expiry_type == "15_minutes":
        return now + timedelta(minutes=15)

    if expiry_type == "1_hour":
        return now + timedelta(hours=1)

    if expiry_type == "24_hours":
        return now + timedelta(hours=24)

    if expiry_type == "7_days":
        return now + timedelta(days=7)

    if expiry_type == "custom":

        if (
            custom_days == 0
            and custom_hours == 0
            and custom_minutes == 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Custom expiry cannot be empty"
            )

        return now + timedelta(
            days=custom_days,
            hours=custom_hours,
            minutes=custom_minutes
        )

    raise HTTPException(
        status_code=400,
        detail="Invalid expiry type"
    )


# =========================================================
# UPLOAD
# =========================================================

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    password: str | None = Form(None),
    expiry_type: str = Form("24_hours"),
    custom_days: int = Form(0),
    custom_hours: int = Form(0),
    custom_minutes: int = Form(0),
    max_downloads: int = Form(3),
    one_time: bool = Form(False),
    db: Session = Depends(get_db)
):

    user_plan = "free"
    limits = PLANS[user_plan]

    try:

        # Generate stored filename
        extension = os.path.splitext(file.filename)[1]

        stored_filename = (
            f"{uuid.uuid4()}{extension}"
        )

        file_path = os.path.join(
            UPLOAD_FOLDER,
            stored_filename
        )

        # Read file
        content = await file.read()

        # File size check
        if len(content) > limits["max_file_size"]:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Free plan allows maximum "
                    f"{limits['max_file_size'] // (1024 * 1024)} MB."
                )
            )

        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # Generate FireFlow code
        share_code = generate_share_code()

        # Download URL
        download_url = (
       f"{FRONTEND_URL}/receive?code={share_code}"
       )

        # Generate QR code
        qr_path = os.path.join(
            QR_FOLDER,
            f"{share_code}.png"
        )

        qr = qrcode.make(download_url)
        qr.save(qr_path)

        # Calculate expiry
        expires_at = calculate_expiry(
            expiry_type,
            custom_days,
            custom_hours,
            custom_minutes
        )

        # Expiry limit
        expiry_hours = (
            expires_at - datetime.utcnow()
        ).total_seconds() / 3600

        if expiry_hours > limits["max_expiry_hours"]:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Free plan allows maximum "
                    f"{limits['max_expiry_hours']} hours expiry."
                )
            )

        # Download limit
        if one_time:
            max_downloads = 1

        elif max_downloads > limits["max_downloads"]:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Free plan allows maximum "
                    f"{limits['max_downloads']} downloads."
                )
            )

        # Save database record
        db_file = FileModel(
            original_filename=file.filename,
            stored_filename=stored_filename,
            share_code=share_code,
            mime_type=file.content_type,
            file_size=len(content),
            password=password,
            expires_at=expires_at,
            max_downloads=max_downloads,
            one_time=one_time
        )

        db.add(db_file)
        db.commit()
        db.refresh(db_file)

        return {
            "message": "File uploaded successfully",
            "plan": user_plan,
            "share_code": share_code,
            "download_url": download_url,
            "qr_code": f"/qr/{share_code}.png",
            "expiry": expires_at,
            "limits": {
                "max_file_size_mb":
                    limits["max_file_size"] // (1024 * 1024),

                "max_downloads":
                    limits["max_downloads"],

                "max_expiry_hours":
                    limits["max_expiry_hours"]
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# CHECK SHARE CODE / NORMAL DOWNLOAD
# =========================================================

@router.get("/share/{code}")
async def get_file(
    code: str,
    db: Session = Depends(get_db)
):

    file = db.query(FileModel).filter(
        FileModel.share_code == code
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Check expiry
    if datetime.utcnow() > file.expires_at:
        raise HTTPException(
            status_code=400,
            detail="File expired"
        )

    # Check download limit
    if file.download_count >= file.max_downloads:
        raise HTTPException(
            status_code=400,
            detail="Download limit reached"
        )

    # Password protected file
    if file.password:
        return {
            "password_required": True,
            "filename": file.original_filename
        }

    return await send_file(
        file,
        db
    )


# =========================================================
# PASSWORD VERIFICATION
# =========================================================

@router.post("/share/{code}/verify")
async def verify_password(
    code: str,
    request: PasswordRequest,
    db: Session = Depends(get_db)
):

    file = db.query(FileModel).filter(
        FileModel.share_code == code
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Check expiry
    if datetime.utcnow() > file.expires_at:
        raise HTTPException(
            status_code=400,
            detail="File expired"
        )

    # Check download limit
    if file.download_count >= file.max_downloads:
        raise HTTPException(
            status_code=400,
            detail="Download limit reached"
        )

    # Check password
    if file.password != request.password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    return await send_file(
        file,
        db
    )


# =========================================================
# SEND FILE
# =========================================================

async def send_file(
    file,
    db: Session
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.stored_filename
    )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Stored file not found"
        )

    # Increase download count
    file.download_count += 1

    db.commit()

    return FileResponse(
        file_path,
        filename=file.original_filename,
        media_type=file.mime_type or "application/octet-stream"
    )