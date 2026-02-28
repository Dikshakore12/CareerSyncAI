# CareerSync AI — Complete Design Doc
Date: 2026-02-28

## Overview
Upgrade existing partial CareerSync AI implementation to a complete, production-ready SaaS platform with:
- LangChain + Gemini 1.5 Flash AI backend
- SQLite analysis history storage
- Token-based auth (hardcoded: dikshak / demo@1234)
- 4 new frontend pages (analytics, pricing, about, platform)
- Fixed home page result rendering
- Analytics dashboard showing real stored data

## Auth Design (Option A)
- POST /auth/login checks hardcoded credentials → returns `{ token: "careersync-demo-token" }`
- All protected routes use FastAPI `Depends(get_current_user)`
- Frontend stores token in localStorage, sends `Authorization: Bearer careersync-demo-token`
- Analytics page is auth-gated (redirect to /login if no token)

## Backend Endpoints
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | / | No | Health check |
| POST | /auth/login | No | Returns token |
| GET | /auth/me | Yes | Current user info |
| POST | /analyze | Yes | AI analysis + store in SQLite |
| GET | /analyses | Yes | All analyses, newest first |
| GET | /analyses/{id} | Yes | Single analysis |
| DELETE | /analyses/{id} | Yes | Delete record |
| GET | /analytics/stats | Yes | Aggregated dashboard stats |

## SQLite Schema
```sql
CREATE TABLE analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  filename TEXT,
  job_title TEXT,
  analysis TEXT NOT NULL,
  match_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## AI Stack
- LangChain with ChatGoogleGenerativeAI(model="gemini-1.5-flash")
- ChatPromptTemplate with system + human messages
- StrOutputParser
- Regex post-processing to extract match_score

## Backend File Structure
```
backend/
  main.py          — FastAPI app, CORS, routes
  ai_logic.py      — LangChain chain
  database.py      — SQLite init + CRUD helpers
  auth.py          — hardcoded credentials + token verification
  requirements.txt — updated deps
  .env             — GEMINI_API_KEY
```

## Frontend Pages
- analytics/page.tsx — auth-gated dashboard (real data from /analytics/stats + /analyses)
- pricing/page.tsx   — 3-tier pricing cards
- about/page.tsx     — mission, team, tech stack
- platform/page.tsx  — feature deep-dive

## Frontend Fixes
- Home page: render AI result below form (was broken)
- Login page: real API call + token storage + redirect
- Cover letter toggle in analyzer form
- AnalyzerForm.tsx + ResultDisplay.tsx components
