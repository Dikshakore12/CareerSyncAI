import sys
# Force UTF-8 stdout so emoji in print() work on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from typing import Optional
import PyPDF2
import docx2txt
import io
import traceback
from pydantic import BaseModel

from ai_logic import analyze_career_match, extract_job_title
from database import init_db, save_analysis, get_analyses, get_analysis_by_id, delete_analysis, get_stats
from auth import verify_token, check_login

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Database initialised.")
    yield

app = FastAPI(title="CareerSync AI API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_file(file: UploadFile) -> str:
    try:
        content = file.file.read()
        file.file.seek(0)
        ext = (file.filename or "").split(".")[-1].lower()

        if ext == "pdf":
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = "".join(
                page.extract_text() or "" for page in reader.pages
            )
            if not text.strip():
                raise HTTPException(400, "No readable text in PDF (possibly scanned image).")
            return text

        elif ext in ("docx", "doc"):
            return docx2txt.process(io.BytesIO(content))

        elif ext == "txt":
            try:
                return content.decode("utf-8")
            except UnicodeDecodeError:
                return content.decode("latin-1")

        else:
            raise HTTPException(400, f"Unsupported file format: .{ext}")

    except HTTPException:
        raise
    except Exception as e:
        print("File extraction error:", traceback.format_exc())
        raise HTTPException(500, str(e))


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/auth/login")
def login(body: LoginRequest):
    return check_login(body.username, body.password)


@app.get("/auth/me")
def me(current_user: dict = Depends(verify_token)):
    return current_user


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    request_cover_letter: Optional[str] = Form(None),
    current_user: dict = Depends(verify_token),
):
    try:
        print(f"▶ /analyze — user={current_user['user_id']}")

        should_gen_cover = (request_cover_letter or "").lower() == "true"
        resume_text = extract_text_from_file(resume)

        if not resume_text.strip():
            raise HTTPException(400, "Resume file is empty or unreadable.")
        if not job_description.strip():
            raise HTTPException(400, "Job description cannot be empty.")

        analysis_text, match_score = analyze_career_match(
            resume_text, job_description, should_gen_cover
        )

        job_title = extract_job_title(job_description)
        filename = resume.filename or "unknown"

        record_id = await save_analysis(
            user_id=current_user["user_id"],
            filename=filename,
            job_title=job_title,
            analysis=analysis_text,
            match_score=match_score,
        )

        print(f"✅ Saved analysis id={record_id} score={match_score}")

        return JSONResponse({
            "analysis": analysis_text,
            "match_score": match_score,
            "record_id": record_id,
        })

    except HTTPException:
        raise
    except Exception as e:
        print("Analyze error:", traceback.format_exc())
        raise HTTPException(500, str(e))


@app.get("/analyses")
async def list_analyses(current_user: dict = Depends(verify_token)):
    records = await get_analyses(current_user["user_id"])
    return {"analyses": records}


@app.get("/analyses/{analysis_id}")
async def get_one(analysis_id: int, current_user: dict = Depends(verify_token)):
    record = await get_analysis_by_id(analysis_id, current_user["user_id"])
    if not record:
        raise HTTPException(404, "Analysis not found.")
    return record


@app.delete("/analyses/{analysis_id}")
async def delete_one(analysis_id: int, current_user: dict = Depends(verify_token)):
    deleted = await delete_analysis(analysis_id, current_user["user_id"])
    if not deleted:
        raise HTTPException(404, "Analysis not found.")
    return {"message": "Deleted successfully."}


@app.get("/analytics/stats")
async def analytics_stats(current_user: dict = Depends(verify_token)):
    stats = await get_stats(current_user["user_id"])
    return stats


@app.get("/")
def health_check():
    return {"status": "CareerSync AI API v2 is running", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
