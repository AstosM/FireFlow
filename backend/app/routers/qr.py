from fastapi import APIRouter
from fastapi.responses import FileResponse
import os


router = APIRouter(
    prefix="/qr",
    tags=["QR"]
)


QR_FOLDER = "uploads/qr"


@router.get("/{filename}")
def get_qr(filename:str):

    path = os.path.join(
        QR_FOLDER,
        filename
    )


    if not os.path.exists(path):
        return {
            "error":"QR not found"
        }


    return FileResponse(
        path,
        media_type="image/png"
    )