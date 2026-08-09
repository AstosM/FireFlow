from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import files
from .routers import download
from .routers import qr


app = FastAPI(
    title="FireFlow API",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Add your Vercel URL here after deployment
        # "https://your-fireflow.vercel.app",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

    expose_headers=["Content-Disposition"],
)


app.include_router(files.router)
app.include_router(download.router)
app.include_router(qr.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to FireFlow 🔥"
    }