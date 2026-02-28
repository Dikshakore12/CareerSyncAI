# CareerSync AI — Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete CareerSync AI from a partial scaffold into a fully working SaaS platform with LangChain+Gemini backend, SQLite history, token auth, and 4 new frontend pages.

**Architecture:** FastAPI backend with LangChain+Gemini 1.5 Flash for AI, SQLite via aiosqlite for analysis history, static Bearer token auth (hardcoded dikshak/demo@1234). Next.js 14 frontend with auth-gated analytics dashboard showing real stored data.

**Tech Stack:** FastAPI, LangChain, langchain-google-genai, aiosqlite, Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons

---

## Phase 1: Backend

### Task 1: Create auth.py

**Files:**
- Create: `backend/auth.py`

**Step 1: Write the file**

```python
# backend/auth.py
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Hardcoded credentials
HARDCODED_USERNAME = "dikshak"
HARDCODED_PASSWORD = "demo@1234"
STATIC_TOKEN = "careersync-demo-token"

HARDCODED_USER = {
    "user_id": "dikshak",
    "name": "Dikshak",
    "email": "dikshak@careersync.ai",
    "role": "admin"
}

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """FastAPI dependency — checks Bearer token."""
    if credentials.credentials != STATIC_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return HARDCODED_USER

def check_login(username: str, password: str):
    """Returns user dict if credentials match, else raises 401."""
    if username == HARDCODED_USERNAME and password == HARDCODED_PASSWORD:
        return {
            "token": STATIC_TOKEN,
            "user": HARDCODED_USER
        }
    raise HTTPException(status_code=401, detail="Invalid username or password.")
```

**Step 2: Verify manually**

In Python REPL: `from auth import check_login; check_login("dikshak", "demo@1234")` → should return dict with token.

---

### Task 2: Create database.py

**Files:**
- Create: `backend/database.py`

**Step 1: Write the file**

```python
# backend/database.py
import aiosqlite
import os
from datetime import datetime
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "careersync.db")

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS analyses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT    NOT NULL,
    filename    TEXT,
    job_title   TEXT,
    analysis    TEXT    NOT NULL,
    match_score INTEGER,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

async def init_db():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_TABLE_SQL)
        await db.commit()

async def save_analysis(
    user_id: str,
    filename: str,
    job_title: str,
    analysis: str,
    match_score: Optional[int]
) -> int:
    """Insert a new analysis record. Returns the new row id."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """INSERT INTO analyses (user_id, filename, job_title, analysis, match_score)
               VALUES (?, ?, ?, ?, ?)""",
            (user_id, filename, job_title, analysis, match_score)
        )
        await db.commit()
        return cursor.lastrowid

async def get_analyses(user_id: str) -> list[dict]:
    """Return all analyses for a user, newest first."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT id, user_id, filename, job_title, match_score, created_at
               FROM analyses
               WHERE user_id = ?
               ORDER BY created_at DESC""",
            (user_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def get_analysis_by_id(analysis_id: int, user_id: str) -> Optional[dict]:
    """Return a single full analysis record."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user_id)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None

async def delete_analysis(analysis_id: int, user_id: str) -> bool:
    """Delete a record. Returns True if a row was deleted."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "DELETE FROM analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user_id)
        )
        await db.commit()
        return cursor.rowcount > 0

async def get_stats(user_id: str) -> dict:
    """Return aggregated stats for the analytics dashboard."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # total count
        cur = await db.execute(
            "SELECT COUNT(*) as total FROM analyses WHERE user_id = ?", (user_id,)
        )
        total = (await cur.fetchone())["total"]

        # average match score (only non-null)
        cur = await db.execute(
            """SELECT AVG(match_score) as avg_score
               FROM analyses WHERE user_id = ? AND match_score IS NOT NULL""",
            (user_id,)
        )
        row = await cur.fetchone()
        avg_score = round(row["avg_score"]) if row["avg_score"] else 0

        # score distribution buckets: 0-39, 40-59, 60-79, 80-100
        cur = await db.execute(
            """SELECT
                 SUM(CASE WHEN match_score < 40 THEN 1 ELSE 0 END) as low,
                 SUM(CASE WHEN match_score >= 40 AND match_score < 60 THEN 1 ELSE 0 END) as medium,
                 SUM(CASE WHEN match_score >= 60 AND match_score < 80 THEN 1 ELSE 0 END) as good,
                 SUM(CASE WHEN match_score >= 80 THEN 1 ELSE 0 END) as excellent
               FROM analyses WHERE user_id = ?""",
            (user_id,)
        )
        dist = dict(await cur.fetchone())

        # last 5 records
        cur = await db.execute(
            """SELECT id, filename, job_title, match_score, created_at
               FROM analyses WHERE user_id = ?
               ORDER BY created_at DESC LIMIT 5""",
            (user_id,)
        )
        recent = [dict(r) for r in await cur.fetchall()]

        return {
            "total_analyses": total,
            "average_score": avg_score,
            "score_distribution": {
                "low": dist["low"] or 0,
                "medium": dist["medium"] or 0,
                "good": dist["good"] or 0,
                "excellent": dist["excellent"] or 0
            },
            "recent_analyses": recent
        }
```

**Step 2: Verify**

No direct run needed — it will be verified when the server starts and calls `init_db()`.

---

### Task 3: Rewrite ai_logic.py with LangChain

**Files:**
- Modify: `backend/ai_logic.py`

**Step 1: Write the file**

```python
# backend/ai_logic.py
import os
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

SYSTEM_PROMPT = """You are CareerSync AI, an advanced AI-powered Career Intelligence and Resume–Job Matchmaking System.

Your primary objective is to analyze resumes and job descriptions intelligently, calculate compatibility, detect skill gaps, and provide structured career guidance.

===============================
OUTPUT FORMAT (STRICT — always follow this exactly)
===============================

📊 Match Score: XX%

✅ Strong Matches
- [skill or qualification that directly matches]

⚠ Partial Matches
- [skill or qualification that partially matches]

❌ Missing Skills
- [skill or qualification that is required but absent]

📈 Resume Improvement Suggestions
- [specific actionable improvement]

🎯 ATS Optimization Tips
- [specific keyword or formatting tip]

🧠 Suggested Learning Roadmap

**6-Month Plan:**
- [month-by-month learning steps]

**12-Month Plan:**
- [longer-term career development steps]

💼 Interview Preparation

**Technical Questions:**
- [role-specific technical question]

**Behavioral Questions:**
- [STAR-method behavioral question]

Rules:
- Match Score must be a realistic integer (0–100) based on actual overlap
- Use emoji headers exactly as shown
- Be specific, professional, and concise
- No exaggeration or flattery
"""

def build_chain():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.4,
        top_p=0.9,
        max_output_tokens=2048,
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{user_input}")
    ])

    chain = prompt | llm | StrOutputParser()
    return chain

# Build once at module load
_chain = build_chain()

def extract_match_score(text: str) -> int | None:
    """Parse 'Match Score: XX%' from AI output. Returns int or None."""
    match = re.search(r"Match Score:\s*(\d+)%", text, re.IGNORECASE)
    if match:
        score = int(match.group(1))
        return max(0, min(100, score))
    return None

def extract_job_title(job_description: str) -> str:
    """Take first non-empty line of job description as job title."""
    for line in job_description.strip().splitlines():
        line = line.strip()
        if line:
            return line[:100]  # cap at 100 chars
    return "Unknown Position"

def analyze_career_match(
    resume_text: str,
    job_description: str,
    request_cover_letter: bool = False
) -> tuple[str, int | None]:
    """
    Run LangChain chain. Returns (analysis_text, match_score_int_or_None).
    """
    if not resume_text.strip() or not job_description.strip():
        return ("⚠ Resume or Job Description is empty.", None)

    user_input = f"""RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""
    if request_cover_letter:
        user_input += "\n\nAlso generate a 📄 Personalized Cover Letter section at the end."

    try:
        result = _chain.invoke({"user_input": user_input})

        if not result or not result.strip():
            return ("⚠ AI returned an empty response. Please try again.", None)

        score = extract_match_score(result)
        return (result.strip(), score)

    except Exception as e:
        print(f"LangChain/Gemini Error: {e}")
        return (f"⚠ AI service error: {str(e)}", None)
```

**Step 2: Verify**

Imports will be checked when server boots. The chain is built at module load — if the API key is wrong it will error immediately on startup rather than silently at request time.

---

### Task 4: Rewrite main.py with all new endpoints

**Files:**
- Modify: `backend/main.py`

**Step 1: Write the file**

```python
# backend/main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from typing import Optional, Annotated
import PyPDF2
import docx2txt
import io
import traceback
from pydantic import BaseModel

from ai_logic import analyze_career_match, extract_job_title
from database import init_db, save_analysis, get_analyses, get_analysis_by_id, delete_analysis, get_stats
from auth import verify_token, check_login

# ==============================
# Lifespan — init DB on startup
# ==============================

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Database initialised.")
    yield

app = FastAPI(title="CareerSync AI API", version="2.0.0", lifespan=lifespan)

# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# File extraction helper
# ==============================

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

# ==============================
# Auth routes
# ==============================

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/auth/login")
def login(body: LoginRequest):
    return check_login(body.username, body.password)

@app.get("/auth/me")
def me(current_user: dict = Depends(verify_token)):
    return current_user

# ==============================
# Analyze endpoint
# ==============================

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

# ==============================
# Analysis history routes
# ==============================

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

# ==============================
# Analytics stats
# ==============================

@app.get("/analytics/stats")
async def analytics_stats(current_user: dict = Depends(verify_token)):
    stats = await get_stats(current_user["user_id"])
    return stats

# ==============================
# Health check
# ==============================

@app.get("/")
def health_check():
    return {"status": "CareerSync AI API v2 is running", "version": "2.0.0"}

# ==============================
# Run
# ==============================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
```

**Step 2: Verify**

Server starts without import errors.

---

### Task 5: Update requirements.txt and install deps

**Files:**
- Modify: `backend/requirements.txt`

**Step 1: Write requirements.txt**

```
fastapi
uvicorn[standard]
python-multipart
python-dotenv
pydantic
PyPDF2
docx2txt
aiosqlite
langchain
langchain-google-genai
langchain-core
```

**Step 2: Install**

```bash
cd backend
venv/Scripts/activate   # Windows
pip install -r requirements.txt
```

Expected: All packages install without error. Key packages: `langchain-google-genai`, `aiosqlite`.

**Step 3: Start the server to verify**

```bash
python main.py
```

Expected output:
```
✅ Database initialised.
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8001
```

**Step 4: Test auth endpoint with curl**

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dikshak","password":"demo@1234"}'
```

Expected: `{"token":"careersync-demo-token","user":{...}}`

**Step 5: Test wrong credentials**

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong"}'
```

Expected: `{"detail":"Invalid username or password."}`

**Step 6: Test protected route without token**

```bash
curl http://localhost:8001/analyses
```

Expected: `{"detail":"Not authenticated"}`

**Step 7: Test protected route with token**

```bash
curl http://localhost:8001/analyses \
  -H "Authorization: Bearer careersync-demo-token"
```

Expected: `{"analyses":[]}`

---

## Phase 2: Frontend Components

### Task 6: Create ResultDisplay.tsx

**Files:**
- Create: `frontend/src/components/ResultDisplay.tsx`

**Step 1: Write the component**

```tsx
// frontend/src/components/ResultDisplay.tsx
"use client";

import { motion } from "framer-motion";
import {
  BarChart3, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Target, Brain, Briefcase, FileText, X
} from "lucide-react";

interface ResultDisplayProps {
  analysis: string;
  matchScore: number | null;
  onClose?: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-600 bg-green-50 border-green-200" :
    score >= 60 ? "text-indigo-600 bg-indigo-50 border-indigo-200" :
    score >= 40 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
                  "text-red-600 bg-red-50 border-red-200";
  const label =
    score >= 80 ? "Excellent Match" :
    score >= 60 ? "Good Match" :
    score >= 40 ? "Partial Match" :
                  "Low Match";

  return (
    <div className={`inline-flex flex-col items-center px-8 py-6 rounded-3xl border-2 ${color}`}>
      <span className="text-6xl font-black">{score}%</span>
      <span className="text-sm font-bold uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function Section({ icon: Icon, title, color, content }: {
  icon: React.ElementType;
  title: string;
  color: string;
  content: string;
}) {
  if (!content.trim()) return null;
  const lines = content.split("\n").filter(l => l.trim());
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 ${color}`}>
        <Icon className="w-5 h-5" />
        <h4 className="font-black text-lg">{title}</h4>
      </div>
      <ul className="space-y-2 pl-2">
        {lines.map((line, i) => {
          const clean = line.replace(/^[-•*]\s*/, "").trim();
          if (!clean) return null;
          return (
            <li key={i} className="flex items-start gap-2 text-gray-700 font-medium">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
              {clean}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function parseSection(text: string, startMarker: string, endMarkers: string[]): string {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return "";
  const afterStart = text.slice(startIdx + startMarker.length);
  let endIdx = afterStart.length;
  for (const end of endMarkers) {
    const idx = afterStart.indexOf(end);
    if (idx !== -1 && idx < endIdx) endIdx = idx;
  }
  return afterStart.slice(0, endIdx).trim();
}

const ALL_MARKERS = [
  "✅", "⚠", "❌", "📈", "🎯", "🧠", "💼", "📄", "📊"
];

export default function ResultDisplay({ analysis, matchScore, onClose }: ResultDisplayProps) {
  const strongMatches  = parseSection(analysis, "✅ Strong Matches",       ALL_MARKERS.filter(m => m !== "✅"));
  const partialMatches = parseSection(analysis, "⚠ Partial Matches",       ALL_MARKERS.filter(m => m !== "⚠"));
  const missingSkills  = parseSection(analysis, "❌ Missing Skills",        ALL_MARKERS.filter(m => m !== "❌"));
  const improvements   = parseSection(analysis, "📈 Resume Improvement",   ALL_MARKERS.filter(m => m !== "📈"));
  const ats            = parseSection(analysis, "🎯 ATS Optimization",     ALL_MARKERS.filter(m => m !== "🎯"));
  const roadmap        = parseSection(analysis, "🧠 Suggested Learning",   ALL_MARKERS.filter(m => m !== "🧠"));
  const interview      = parseSection(analysis, "💼 Interview Preparation",ALL_MARKERS.filter(m => m !== "💼"));
  const coverLetter    = parseSection(analysis, "📄 Personalized Cover Letter", []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 space-y-8"
    >
      {/* Header */}
      <div className="card-botmax relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <div className="flex flex-col md:flex-row items-center gap-8">
          {matchScore !== null && <ScoreBadge score={matchScore} />}
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Analysis Complete</h3>
            <p className="text-gray-500 font-medium">
              Your resume has been analyzed against the job description. Review the detailed breakdown below.
            </p>
          </div>
        </div>
      </div>

      {/* Match breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strongMatches && (
          <div className="card-botmax p-8 border-green-100">
            <Section icon={CheckCircle2} title="Strong Matches" color="text-green-600" content={strongMatches} />
          </div>
        )}
        {partialMatches && (
          <div className="card-botmax p-8 border-yellow-100">
            <Section icon={AlertTriangle} title="Partial Matches" color="text-yellow-600" content={partialMatches} />
          </div>
        )}
        {missingSkills && (
          <div className="card-botmax p-8 border-red-100">
            <Section icon={XCircle} title="Missing Skills" color="text-red-600" content={missingSkills} />
          </div>
        )}
      </div>

      {/* Improvements + ATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {improvements && (
          <div className="card-botmax p-8">
            <Section icon={TrendingUp} title="Resume Improvements" color="text-indigo-600" content={improvements} />
          </div>
        )}
        {ats && (
          <div className="card-botmax p-8">
            <Section icon={Target} title="ATS Optimization" color="text-purple-600" content={ats} />
          </div>
        )}
      </div>

      {/* Roadmap */}
      {roadmap && (
        <div className="card-botmax p-8">
          <Section icon={Brain} title="Learning Roadmap" color="text-blue-600" content={roadmap} />
        </div>
      )}

      {/* Interview */}
      {interview && (
        <div className="card-botmax p-8">
          <Section icon={Briefcase} title="Interview Preparation" color="text-pink-600" content={interview} />
        </div>
      )}

      {/* Cover letter */}
      {coverLetter && (
        <div className="card-botmax p-8 bg-gray-900 text-white">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h4 className="font-black text-lg">Personalized Cover Letter</h4>
          </div>
          <div className="whitespace-pre-wrap text-gray-300 font-medium leading-relaxed">
            {coverLetter}
          </div>
        </div>
      )}

      {/* Raw fallback */}
      {!strongMatches && !missingSkills && (
        <div className="card-botmax p-8">
          <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
            {analysis}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
```

---

### Task 7: Create AnalyzerForm.tsx

**Files:**
- Create: `frontend/src/components/AnalyzerForm.tsx`

**Step 1: Write the component**

```tsx
// frontend/src/components/AnalyzerForm.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, Sparkles, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ResultDisplay from "./ResultDisplay";

const API_BASE = "http://localhost:8001";

export default function AnalyzerForm() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [requestCoverLetter, setRequestCoverLetter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; match_score: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("cs_token") : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jobDescription.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription);
    formData.append("request_cover_letter", String(requestCoverLetter));

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Analysis failed. Please try again.");
        return;
      }

      setResult({ analysis: data.analysis, match_score: data.match_score });
    } catch (err) {
      setError("Cannot connect to backend. Make sure the server is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-botmax border-2 border-indigo-50"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Resume upload */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">
                Step 1 — Upload Resume
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
                  resume
                    ? "border-green-400 bg-green-50/50"
                    : "border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => e.target.files?.[0] && setResume(e.target.files[0])}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                {resume ? (
                  <>
                    <FileText className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="font-bold text-green-700 truncate">{resume.name}</p>
                    <p className="text-sm text-green-500 mt-1">
                      {(resume.size / 1024).toFixed(1)} KB — click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-bold text-gray-600">Drop or click to upload</p>
                    <p className="text-sm text-gray-400 mt-1">PDF, DOCX, or TXT</p>
                  </>
                )}
              </div>
            </div>

            {/* Job description */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">
                Step 2 — Paste Job Description
              </label>
              <textarea
                required
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="input-botmax h-52 resize-none"
                placeholder="Paste the full job description here..."
              />
            </div>
          </div>

          {/* Cover letter toggle */}
          <label className="flex items-center gap-4 cursor-pointer group">
            <div
              onClick={() => setRequestCoverLetter(v => !v)}
              className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                requestCoverLetter ? "bg-indigo-600" : "bg-gray-200"
              } relative`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  requestCoverLetter ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
            <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
              Also generate a personalized cover letter
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-semibold text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !resume || !jobDescription.trim()}
            className="btn-primary-botmax w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Career Path...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Run AI Sync
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Result */}
      {result && (
        <ResultDisplay
          analysis={result.analysis}
          matchScore={result.match_score}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  );
}
```

---

## Phase 3: Fix Existing Frontend Pages

### Task 8: Update home page.tsx

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Step 1: Replace entire file**

Replace the entire `frontend/src/app/page.tsx` content. The new version imports `AnalyzerForm` and removes the inline duplicate form logic. Key changes:
- Import and use `AnalyzerForm` in the analyzer section
- Remove all the old inline form + fetch logic
- Keep all existing sections (Hero, Problem, Features Grid, Analytics Preview, CTA)

```tsx
"use client";

import {
  Sparkles, ChevronRight, BrainCircuit, Target, ShieldCheck,
  AlertTriangle, TrendingUp, ArrowRight, Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";
import AnalyzerForm from "@/components/AnalyzerForm";

export default function Home() {
  return (
    <div className="bg-botmax-gradient selection:bg-indigo-100 selection:text-indigo-900">

      {/* Hero */}
      <section className="relative pt-60 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pill-badge mb-10 mx-auto"
          >
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
            #1 AI Career Orchestration Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[6.5rem] font-black tracking-tight text-gray-900 leading-[1.05] mb-10"
          >
            Intelligent Careers. <br />
            <span className="text-gradient-botmax">Powered by AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-500 font-medium max-w-4xl mx-auto leading-relaxed mb-14"
          >
            CareerSync AI analyzes resumes, matches jobs, detects skill gaps,
            and provides personalized growth strategies — all in one intelligent ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={() => document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary-botmax group"
            >
              Try It Free
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 py-5 rounded-full bg-white text-gray-900 font-bold text-xl border-2 border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-3"
            >
              Analyze My Resume
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                The Career <br />
                <span className="text-indigo-600">Gap Problem</span>
              </h2>
              <div className="space-y-6 text-xl text-gray-500 font-medium leading-relaxed">
                <p>
                  Most job seekers struggle with a fragmented career search process.
                  From invisible ATS rejection to unclear skill requirements.
                </p>
                <div className="space-y-4">
                  {[
                    "ATS rejection despite high qualifications",
                    "Uncertainty about missing technical skill gaps",
                    "Low shortlisting rates due to unoptimized resumes",
                    "Unclear direction for professional growth",
                  ].map((problem) => (
                    <div key={problem} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-gray-700">{problem}</span>
                    </div>
                  ))}
                </div>
                <p className="text-indigo-600 font-bold italic pt-4">
                  CareerSync AI solves this using Large Language Models to decode
                  industry needs and align your profile instantly.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card-botmax p-12 relative z-10">
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-100">
                    <span className="text-lg font-bold text-red-600">Without CareerSync</span>
                    <span className="text-sm font-black text-red-400">~12% shortlist rate</span>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <span className="text-lg font-bold text-indigo-600">With CareerSync AI</span>
                    <span className="text-sm font-black text-indigo-400">~78% match accuracy</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-[100px] opacity-10 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-8">
            Powerful AI. <span className="text-indigo-600">Real Career Results.</span>
          </h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: BrainCircuit, color: "bg-purple-500", title: "Smart Resume Intelligence", desc: "Advanced NLP parsing to extract hidden value from your work history." },
            { icon: Target, color: "bg-indigo-500", title: "Job Compatibility Engine", desc: "Instant matching score between your profile and job requirements." },
            { icon: ShieldCheck, color: "bg-blue-500", title: "ATS Optimization", desc: "Bypass recruiter screening filters with intelligent keyword alignment." },
            { icon: AlertTriangle, color: "bg-pink-500", title: "Skill Gap Detection", desc: "Precisely identify what skills you lack for your dream role." },
            { icon: TrendingUp, color: "bg-green-500", title: "Career Roadmap Generator", desc: "6-month and 12-month strategic learning and growth plans." },
            { icon: Sparkles, color: "bg-yellow-500", title: "AI Interview Simulator", desc: "Practice role-specific questions with real-time feedback." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-botmax group hover:border-indigo-200 transition-all cursor-pointer"
            >
              <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 tracking-tight">{feature.title}</h3>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works + Analyzer */}
      <section id="analyzer" className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
              How It Works
            </h2>
            <div className="flex items-center justify-center gap-8 text-indigo-600 font-bold text-sm uppercase tracking-widest">
              <span>01. Upload</span>
              <ArrowRight className="w-4 h-4" />
              <span>02. Paste</span>
              <ArrowRight className="w-4 h-4" />
              <span>03. Sync</span>
            </div>
          </div>
          <AnalyzerForm />
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            Real-Time Career Intelligence
          </h2>
          <p className="text-xl text-gray-500 font-medium">
            Get detailed visual insights into your professional alignment.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card-botmax p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-bold">Resume Score</h4>
              <span className="text-indigo-600 font-black text-2xl">78%</span>
            </div>
            <div className="space-y-6">
              {[
                { label: "Technical Proficiency", score: 85 },
                { label: "Impact Metrics", score: 62 },
                { label: "Keyword Alignment", score: 88 },
                { label: "Formatting Score", score: 75 },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-600">{stat.label}</span>
                    <span className="text-indigo-600">{stat.score}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.score}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-botmax p-8 bg-gray-900 text-white">
            <h4 className="text-xl font-bold mb-8">AI Insight Panel</h4>
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-yellow-400 font-bold">
                  <Lightbulb className="w-5 h-5" />
                  <span>Strategic Advice</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  You are missing "Kubernetes" experience. Consider adding Docker projects to bridge this gap.
                </p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-green-400 font-bold">
                  <TrendingUp className="w-5 h-5" />
                  <span>Growth Opportunity</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Your profile matches 92% of leadership requirements. Strong candidate for Senior roles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto card-botmax bg-indigo-600 text-white text-center p-24 relative overflow-hidden">
          <div className="relative z-10 space-y-12">
            <h2 className="text-6xl font-black tracking-tight leading-tight">
              Start Building Your <br /> Future Today
            </h2>
            <button
              onClick={() => document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" })}
              className="px-12 py-6 rounded-full bg-white text-indigo-600 font-black text-2xl hover:scale-105 transition-all shadow-2xl"
            >
              Analyze Your Resume — Free
            </button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full -ml-48 -mb-48 blur-3xl" />
        </div>
      </section>
    </div>
  );
}
```

---

### Task 9: Fix login/page.tsx — real API call + token storage

**Files:**
- Modify: `frontend/src/app/login/page.tsx`

**Step 1: Replace the file**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff } from "lucide-react";

const API_BASE = "http://localhost:8001";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Login failed.");
        return;
      }
      localStorage.setItem("cs_token", data.token);
      localStorage.setItem("cs_user", JSON.stringify(data.user));
      router.push("/analytics");
    } catch {
      setError("Cannot connect to backend. Make sure the server is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-botmax-gradient flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-3 text-gray-500 font-medium">Sign in to your CareerSync AI dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="card-botmax p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="input-botmax"
              placeholder="dikshak"
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="input-botmax pr-14"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-[2.9rem] text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-botmax"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="pt-4 p-4 bg-indigo-50 rounded-2xl text-center text-sm text-indigo-700">
            <p className="font-bold mb-1">Demo credentials</p>
            <p className="font-mono">dikshak / demo@1234</p>
          </div>
        </form>

        <p className="text-center text-sm font-semibold text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

## Phase 4: New Frontend Pages

### Task 10: Create analytics/page.tsx

**Files:**
- Create: `frontend/src/app/analytics/page.tsx`

**Step 1: Write the page**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, FileSearch, Clock, Trash2,
  LogOut, User, RefreshCw, ChevronRight
} from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:8001";

interface Stats {
  total_analyses: number;
  average_score: number;
  score_distribution: {
    low: number;
    medium: number;
    good: number;
    excellent: number;
  };
  recent_analyses: Array<{
    id: number;
    filename: string;
    job_title: string;
    match_score: number | null;
    created_at: string;
  }>;
}

interface Analysis {
  id: number;
  filename: string;
  job_title: string;
  match_score: number | null;
  created_at: string;
}

function ScoreBar({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900">{count}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm font-bold">N/A</span>;
  const color =
    score >= 80 ? "bg-green-100 text-green-700" :
    score >= 60 ? "bg-indigo-100 text-indigo-700" :
    score >= 40 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-black ${color}`}>
      {score}%
    </span>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("cs_token");

  const logout = () => {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
    router.push("/login");
  };

  const fetchData = async () => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, analysesRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/stats`, { headers }),
        fetch(`${API_BASE}/analyses`, { headers }),
      ]);

      if (statsRes.status === 401 || analysesRes.status === 401) {
        logout();
        return;
      }

      const statsData = await statsRes.json();
      const analysesData = await analysesRes.json();

      setStats(statsData);
      setAnalyses(analysesData.analyses || []);

      const stored = localStorage.getItem("cs_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setError("Failed to load dashboard data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: number) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_BASE}/analyses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("cs_token");
      if (!token) { router.push("/login"); return; }
      fetchData();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-botmax-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botmax-gradient pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="pill-badge mb-4">
              <BarChart3 className="w-3 h-3" />
              Analytics Dashboard
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome back, {user?.name || "Dikshak"} 👋
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Here's your complete career analysis history and insights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link
              href="/#analyzer"
              className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              New Analysis
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 text-gray-600 font-bold text-sm hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-botmax p-8 text-center"
            >
              <FileSearch className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <div className="text-5xl font-black text-gray-900">{stats.total_analyses}</div>
              <div className="text-gray-500 font-semibold mt-2">Total Analyses</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-botmax p-8 text-center"
            >
              <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <div className="text-5xl font-black text-gray-900">{stats.average_score}%</div>
              <div className="text-gray-500 font-semibold mt-2">Average Match Score</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-botmax p-8 text-center"
            >
              <BarChart3 className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <div className="text-5xl font-black text-gray-900">
                {stats.score_distribution.excellent + stats.score_distribution.good}
              </div>
              <div className="text-gray-500 font-semibold mt-2">Strong Matches (60%+)</div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score distribution */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-botmax p-8 space-y-6"
            >
              <h3 className="text-xl font-black text-gray-900">Score Distribution</h3>
              <div className="space-y-4">
                <ScoreBar
                  label="Excellent (80-100%)"
                  count={stats.score_distribution.excellent}
                  total={stats.total_analyses}
                  color="bg-green-500"
                />
                <ScoreBar
                  label="Good (60-79%)"
                  count={stats.score_distribution.good}
                  total={stats.total_analyses}
                  color="bg-indigo-500"
                />
                <ScoreBar
                  label="Partial (40-59%)"
                  count={stats.score_distribution.medium}
                  total={stats.total_analyses}
                  color="bg-yellow-500"
                />
                <ScoreBar
                  label="Low (0-39%)"
                  count={stats.score_distribution.low}
                  total={stats.total_analyses}
                  color="bg-red-400"
                />
              </div>
            </motion.div>
          )}

          {/* All analyses table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 card-botmax p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">All Analyses</h3>
              <span className="text-sm text-gray-400 font-semibold">{analyses.length} records</span>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="font-semibold">No analyses yet.</p>
                <p className="text-sm mt-2">Run your first analysis from the home page.</p>
                <Link
                  href="/#analyzer"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
                >
                  Analyze Resume <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="pb-4 pr-4">File</th>
                      <th className="pb-4 pr-4">Job Title</th>
                      <th className="pb-4 pr-4">Score</th>
                      <th className="pb-4 pr-4">Date</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {analyses.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 pr-4">
                          <span className="font-semibold text-gray-800 text-sm truncate max-w-[120px] block">
                            {a.filename}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-gray-600 text-sm truncate max-w-[140px] block">
                            {a.job_title}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <ScorePill score={a.match_score} />
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            {new Date(a.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </div>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => deleteAnalysis(a.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 11: Create platform/page.tsx

**Files:**
- Create: `frontend/src/app/platform/page.tsx`

**Step 1: Write the page**

```tsx
"use client";

import { motion } from "framer-motion";
import {
  Upload, Brain, Target, ShieldCheck, TrendingUp,
  MessageSquare, FileText, ArrowRight, CheckCircle2, Sparkles
} from "lucide-react";

const features = [
  {
    icon: Upload,
    color: "bg-indigo-500",
    title: "Resume Upload & Parsing",
    desc: "Upload PDF, DOCX, or TXT resume files. Our parser extracts skills, experience, education, and achievements from any format.",
    bullets: ["PDF, DOCX, TXT supported", "Multi-page document support", "Scanned PDF detection"],
  },
  {
    icon: Brain,
    color: "bg-purple-500",
    title: "AI-Powered Skill Extraction",
    desc: "LangChain + Gemini 1.5 Flash intelligently identifies both explicit and implicit skills across your entire resume.",
    bullets: ["LangChain orchestration", "Gemini 1.5 Flash LLM", "Implicit skill detection"],
  },
  {
    icon: Target,
    color: "bg-blue-500",
    title: "Job Compatibility Engine",
    desc: "Paste any job description and get a real match score based on skill overlap, experience level, and role requirements.",
    bullets: ["0–100% realistic scoring", "Strong / Partial / Missing categories", "Per-skill breakdown"],
  },
  {
    icon: ShieldCheck,
    color: "bg-green-500",
    title: "ATS Optimization",
    desc: "Applicant Tracking Systems filter 75% of resumes before a human sees them. We tell you exactly what to add.",
    bullets: ["Keyword gap analysis", "Formatting recommendations", "Industry-specific terms"],
  },
  {
    icon: TrendingUp,
    color: "bg-pink-500",
    title: "Career Roadmap Generator",
    desc: "Get a personalized 6-month and 12-month learning plan to bridge your skill gaps and reach your career goals.",
    bullets: ["6-month sprint plan", "12-month growth strategy", "Resource recommendations"],
  },
  {
    icon: MessageSquare,
    color: "bg-yellow-500",
    title: "Interview Preparation AI",
    desc: "Role-specific technical and behavioral questions generated from the actual job description — not generic templates.",
    bullets: ["Technical question bank", "STAR behavioral questions", "Difficulty-calibrated"],
  },
  {
    icon: FileText,
    color: "bg-teal-500",
    title: "Cover Letter Generator",
    desc: "Optional AI-generated cover letter personalized to the specific job and company, in a professional tone.",
    bullets: ["Job-specific content", "Professional tone", "Customizable output"],
  },
];

export default function PlatformPage() {
  return (
    <div className="bg-botmax-gradient min-h-screen">
      {/* Hero */}
      <section className="pt-48 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pill-badge mb-8 mx-auto"
          >
            <Sparkles className="w-3 h-3" />
            The Platform
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight mb-8"
          >
            Every Tool You Need <br />
            <span className="text-gradient-botmax">To Land Your Dream Job</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-medium max-w-2xl mx-auto"
          >
            CareerSync AI packs an entire career coaching session into a single AI-powered workflow.
          </motion.p>
        </div>
      </section>

      {/* How it works — pipeline */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">The 3-Step Pipeline</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {[
              { step: "01", title: "Upload", desc: "Drop your resume file" },
              { step: "02", title: "Paste", desc: "Add the job description" },
              { step: "03", title: "Sync", desc: "Get full AI analysis" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-6 flex-1">
                <div className="card-botmax p-8 text-center flex-1">
                  <div className="text-5xl font-black text-indigo-200 mb-4">{s.step}</div>
                  <h3 className="text-xl font-black text-gray-900">{s.title}</h3>
                  <p className="text-gray-500 font-medium mt-2">{s.desc}</p>
                </div>
                {i < 2 && <ArrowRight className="w-8 h-8 text-indigo-300 flex-shrink-0 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">
            All Features <span className="text-indigo-600">in Detail</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-botmax group"
              >
                <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">{f.desc}</p>
                <ul className="space-y-2">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-6">Built With Modern AI Stack</h2>
          <p className="text-gray-500 font-medium mb-12">
            Industry-standard tools trusted by production AI systems.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["LangChain", "Gemini 1.5 Flash", "FastAPI", "Next.js 14", "SQLite", "Python 3.10+", "TypeScript", "Tailwind CSS"].map((tech) => (
              <span
                key={tech}
                className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-full font-bold text-gray-700 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

### Task 12: Create pricing/page.tsx

**Files:**
- Create: `frontend/src/app/pricing/page.tsx`

**Step 1: Write the page**

```tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Zap, Building2 } from "lucide-react";

const plans = [
  {
    icon: Sparkles,
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for students and first-time job seekers.",
    color: "border-gray-200",
    buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
    features: [
      "5 resume analyses per month",
      "Job compatibility score",
      "Basic skill gap detection",
      "ATS optimization tips",
      "Email support",
    ],
    highlighted: false,
  },
  {
    icon: Zap,
    name: "Pro",
    price: "₹499",
    period: "per month",
    desc: "For active job seekers who need full AI power.",
    color: "border-indigo-500 shadow-2xl shadow-indigo-500/20",
    buttonClass: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/30",
    features: [
      "Unlimited analyses",
      "Career roadmap (6 & 12 months)",
      "AI interview preparation",
      "Cover letter generator",
      "Analytics dashboard",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    icon: Building2,
    name: "Enterprise",
    price: "₹2,499",
    period: "per month",
    desc: "For teams, colleges, and placement cells.",
    color: "border-gray-200",
    buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
    features: [
      "Everything in Pro",
      "Up to 50 team members",
      "Bulk resume processing",
      "Custom AI fine-tuning",
      "API access",
      "Dedicated support & SLA",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-botmax-gradient min-h-screen pt-40 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pill-badge mb-8 mx-auto"
          >
            Simple Pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black text-gray-900 tracking-tight mb-6"
          >
            Plans That Match <br />
            <span className="text-gradient-botmax">Your Career Stage</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-medium"
          >
            No hidden fees. No credit card for free plan.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-[2.5rem] border-2 p-10 ${plan.color} ${plan.highlighted ? "scale-105" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${
                plan.highlighted ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
              }`}>
                <plan.icon className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-500 font-medium mb-8">{plan.desc}</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-400 font-semibold ml-2">/{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "text-indigo-500" : "text-gray-400"
                    }`} />
                    <span className="text-gray-600 font-medium text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${plan.buttonClass}`}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center card-botmax p-12"
        >
          <h3 className="text-3xl font-black text-gray-900 mb-4">
            Have questions about pricing?
          </h3>
          <p className="text-gray-500 font-medium mb-8">
            This is a final-year CSE demonstration project. All features are available for free locally.
          </p>
          <span className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
            contact@careersync.ai
          </span>
        </motion.div>
      </div>
    </div>
  );
}
```

---

### Task 13: Create about/page.tsx

**Files:**
- Create: `frontend/src/app/about/page.tsx`

**Step 1: Write the page**

```tsx
"use client";

import { motion } from "framer-motion";
import {
  Target, Sparkles, Heart, GraduationCap,
  Linkedin, Github, Mail
} from "lucide-react";

const team = [
  {
    name: "Dikshak",
    role: "Full-Stack & AI Engineer",
    desc: "Built the LangChain + Gemini AI pipeline and FastAPI backend.",
    initials: "DK",
    color: "bg-indigo-500",
  },
  {
    name: "Frontend Lead",
    role: "UI/UX & React Engineer",
    desc: "Designed the Next.js frontend with Tailwind CSS and Framer Motion.",
    initials: "FL",
    color: "bg-purple-500",
  },
  {
    name: "Research Lead",
    role: "NLP & Career Domain Expert",
    desc: "Designed the AI prompts, scoring logic, and career roadmap framework.",
    initials: "RL",
    color: "bg-pink-500",
  },
];

const techStack = [
  { category: "AI / ML", items: ["LangChain", "Gemini 1.5 Flash", "Google Generative AI"] },
  { category: "Backend", items: ["FastAPI", "Python 3.10", "aiosqlite", "PyPDF2"] },
  { category: "Frontend", items: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { category: "Database", items: ["SQLite", "aiosqlite async driver"] },
];

export default function AboutPage() {
  return (
    <div className="bg-botmax-gradient min-h-screen">
      {/* Hero */}
      <section className="pt-48 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pill-badge mb-8 mx-auto"
          >
            <Heart className="w-3 h-3 text-red-500" />
            Our Story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight mb-8"
          >
            Built by Students, <br />
            <span className="text-gradient-botmax">For Every Job Seeker</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-medium max-w-2xl mx-auto"
          >
            CareerSync AI started as a Final Year CSE project at Nagpur. We experienced ATS rejection
            firsthand and decided to build the tool we wished existed.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              title: "Our Mission",
              desc: "Democratize career intelligence so every student and professional — regardless of background — gets the same quality of career guidance that expensive coaches provide.",
            },
            {
              icon: Sparkles,
              color: "text-purple-600",
              bg: "bg-purple-50",
              title: "Our Technology",
              desc: "We use Google's Gemini 1.5 Flash LLM via LangChain to analyze resumes and job descriptions. The output is structured, realistic, and tailored — not generic templates.",
            },
            {
              icon: GraduationCap,
              color: "text-pink-600",
              bg: "bg-pink-50",
              title: "Academic Context",
              desc: "This platform is a Final Year Computer Science & Engineering capstone project demonstrating real-world AI, REST APIs, and full-stack development skills.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-botmax text-center"
            >
              <div className={`${item.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-botmax text-center group"
              >
                <div className={`${member.color} w-20 h-20 rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {member.initials}
                </div>
                <h3 className="text-xl font-black text-gray-900">{member.name}</h3>
                <p className="text-indigo-600 font-bold text-sm mt-1 mb-4">{member.role}</p>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{member.desc}</p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-botmax p-8"
              >
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                  {cat.category}
                </h4>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li key={item} className="text-gray-700 font-semibold text-sm">{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## Phase 5: Integration Testing

### Task 14: Full integration test

**Step 1: Start backend**

```bash
cd backend
venv/Scripts/activate
python main.py
```

Expected: `✅ Database initialised.` + Uvicorn running on port 8001.

**Step 2: Start frontend**

```bash
cd frontend
npm run dev
```

Expected: Next.js running on http://localhost:3000

**Step 3: Test login flow**
1. Open http://localhost:3000/login
2. Enter `dikshak` / `demo@1234`
3. Click Sign In
4. Expected: Redirect to /analytics, shows empty dashboard

**Step 4: Test wrong credentials**
1. Open http://localhost:3000/login
2. Enter `wrong` / `wrong`
3. Expected: Error message "Invalid username or password."

**Step 5: Test analyzer**
1. Navigate to http://localhost:3000 (home page)
2. Scroll to "How It Works" section
3. Upload any PDF/DOCX resume
4. Paste a sample job description
5. Click "Run AI Sync"
6. Expected: Loading spinner, then ResultDisplay component renders with score badge + sections

**Step 6: Verify analytics dashboard**
1. Navigate to http://localhost:3000/analytics
2. Expected: Total analyses = 1, score shown, row in table

**Step 7: Test protected route without login**
1. Clear localStorage (DevTools > Application > Local Storage > Clear)
2. Navigate to http://localhost:3000/analytics
3. Expected: Redirect to /login

**Step 8: Test delete**
1. In analytics table, hover a row
2. Click the trash icon
3. Expected: Row disappears, total count decreases

**Step 9: Test cover letter toggle**
1. Go back to home analyzer
2. Toggle "Also generate a personalized cover letter" ON
3. Upload resume + paste JD + submit
4. Expected: Result includes 📄 Personalized Cover Letter section

**Step 10: Verify all pages load**
- /platform → Features page renders
- /pricing → 3-tier pricing cards render
- /about → Team + tech stack renders
- /login → Login form renders
- /signup → Signup form renders

---

## Memory file to create after completion

Save to: `C:\Users\soham\.claude\projects\D--HP-Shared-All-Freelance-Projects-CareerSyncAI\memory\MEMORY.md`

```markdown
# CareerSync AI Project Memory

## Project Structure
- Backend: D:/HP Shared/All Freelance Projects/CareerSyncAI/backend/
  - main.py (FastAPI, port 8001)
  - ai_logic.py (LangChain + gemini-1.5-flash)
  - database.py (aiosqlite + SQLite)
  - auth.py (hardcoded: dikshak/demo@1234, token: careersync-demo-token)
  - careersync.db (auto-created on first run)
- Frontend: D:/HP Shared/All Freelance Projects/CareerSyncAI/frontend/
  - Next.js 14, TypeScript, Tailwind CSS, Framer Motion
  - API_BASE = http://localhost:8001

## Auth
- Credentials: dikshak / demo@1234
- Token: careersync-demo-token (static Bearer token)
- Stored in: localStorage key "cs_token"
- Protected pages: /analytics (redirects to /login if no token)

## Key Commands
- Backend: cd backend && python main.py
- Frontend: cd frontend && npm run dev
```
