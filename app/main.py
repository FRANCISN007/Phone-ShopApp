from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.routing import APIRoute
from app.database import engine, Base
from app.users.routers import router as user_router
from app.license.router import router as license_router
from app.products.router import router as product_router

from backup.backup import router as backup_router
#from app.system.router import router as system_router



import uvicorn
import os
import sys
import pytz
from datetime import datetime
from dotenv import load_dotenv
from contextlib import asynccontextmanager


from pathlib import Path

# Find .env even in frozen or packaged mode
POSSIBLE_ENV_PATHS = [
    Path(__file__).resolve().parent.parent / ".env",        # normal
    Path(sys.executable).resolve().parent / ".env",         # frozen exe
    Path.cwd() / ".env",                                   # runtime cwd
]

for env_path in POSSIBLE_ENV_PATHS:
    if env_path.exists():
        print(f"[INFO] Loading environment from: {env_path}")
        load_dotenv(env_path, override=True)
        break
else:
    print("[WARNING] .env file not found!")

# Load environment variables
#load_dotenv()

SERVER_IP = os.getenv("SERVER_IP", "127.0.0.1")
print("Running on SERVER_IP:", SERVER_IP)


# Ensure upload folder exists
os.makedirs("uploads/attachments", exist_ok=True)

# Set default timezone to Africa/Lagos
os.environ["TZ"] = "Africa/Lagos"
lagos_tz = pytz.timezone("Africa/Lagos")
current_time = datetime.now(lagos_tz)

# Adjust sys path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Database startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup")
    Base.metadata.create_all(bind=engine)
    yield
    print("Application shutdown")

# Create app
app = FastAPI(
    title="PHONE SHOP APP",
    description="An API for managing Phone shop operations including Purchase, Sales, Stock, and Payments.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, change to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/files", StaticFiles(directory="uploads"), name="files")


# Static React frontend
react_build_dir = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "react-frontend", "build")
)
react_static_dir = os.path.join(react_build_dir, "static")

# ✅ Only mount if directory exists
# Serve entire React build dir
if os.path.isdir(react_build_dir):
    app.mount("/static", StaticFiles(directory=react_static_dir), name="static")
    print(f"[INFO] Serving static files from {react_static_dir}")
else:
    print(f"[WARNING] React static directory not found: {react_static_dir} — skipping static mount")


# Routers
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(license_router, prefix="/license", tags=["License"])
app.include_router(product_router, prefix="/products", tags=["Products"])

app.include_router(backup_router)



@app.get("/health")
def health_check():
    return {"status": "ok"}

#app.include_router(system_router,  prefix="/system", tags=["System"])



# Simple health check
@app.get("/debug/ping")
def debug_ping():
    return {"status": "ok"}

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    index_file = os.path.join(react_build_dir, "index.html")
    request_file = os.path.join(react_build_dir, full_path)

    # If the file exists in build (manifest.json, favicon.ico, etc.), serve it
    if os.path.isfile(request_file):
        return FileResponse(request_file)

    # Otherwise serve React index.html (SPA fallback)
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    return JSONResponse(status_code=404, content={"detail": "Frontend not built or missing."})