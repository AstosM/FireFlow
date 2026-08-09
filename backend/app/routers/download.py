from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import File as FileModel
from ..schemas import PasswordRequest

from fastapi.templating import Jinja2Templates

import os
from datetime import datetime, timezone
from fastapi import Form

router = APIRouter(
    prefix="/share",
    tags=["Download"]
)


UPLOAD_FOLDER = "uploads"


templates = Jinja2Templates(
    directory="app/templates"
)

# SHARE PAGE


@router.get(
    "/{share_code}",
    response_class=HTMLResponse
)
def download_page(
    request: Request,
    share_code: str,
    db: Session = Depends(get_db)
):

    file = db.query(FileModel).filter(
        FileModel.share_code == share_code
    ).first()


    if not file:
        raise HTTPException(
            status_code=404,
            detail="Invalid share link"
        )


    now = datetime.now(timezone.utc)


    # expiry check
    if file.expires_at.replace(
        tzinfo=timezone.utc
    ) < now:

        return templates.TemplateResponse(
            name="download.html",
            request=request,
            context={
                "expired": True,
                "message": "File link expired"
            }
        )


    # download limit
    if file.download_count >= file.max_downloads:

        return templates.TemplateResponse(
            name="download.html",
            request=request,
            context={
                "expired": True,
                "message": "Download limit reached"
            }
        )


    return templates.TemplateResponse(
    name="download.html",
    request=request,
    context={
        "expired": False,
        "file": file,
        "protected": True if file.password else False
    }
)



# DIRECT DOWNLOAD


@router.get(
    "/download/{share_code}"
)
def download_file(
    share_code: str,
    db: Session = Depends(get_db)
):


    file = db.query(FileModel).filter(
        FileModel.share_code == share_code
    ).first()



    if not file:
        raise HTTPException(
            status_code=404,
            detail="Invalid share link"
        )



    now = datetime.now(timezone.utc)


    if file.expires_at.replace(
        tzinfo=timezone.utc
    ) < now:

        raise HTTPException(
            status_code=410,
            detail="File expired"
        )



    if file.download_count >= file.max_downloads:

        raise HTTPException(
            status_code=403,
            detail="Download limit reached"
        )



    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.stored_filename
    )



    if not os.path.exists(file_path):

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )



    # increase download count

    file.download_count += 1


    # one time delete after download

    if file.one_time:
        db.commit()

    else:
        db.commit()



    return FileResponse(
        path=file_path,
        filename=file.original_filename,
        media_type=file.mime_type
    )



# PASSWORD VERIFY


@router.post(
    "/{share_code}/verify"
)
def verify_password(
    share_code: str,
    password: str = Form(...),
    db: Session = Depends(get_db)
):


    file = db.query(FileModel).filter(
        FileModel.share_code == share_code
    ).first()

    if not file:

        raise HTTPException(
            status_code=404,
            detail="Invalid share link"
        )



    if password != file.password:

        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )



    now = datetime.now(timezone.utc)


    if file.expires_at.replace(
        tzinfo=timezone.utc
    ) < now:

        raise HTTPException(
            status_code=410,
            detail="File expired"
        )



    if file.download_count >= file.max_downloads:

        raise HTTPException(
            status_code=403,
            detail="Download limit reached"
        )



    # Redirect directly to download

    return RedirectResponse(
        url=f"/share/download/{share_code}",
        status_code=303
    )