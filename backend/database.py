# backend/database.py
import aiosqlite
import os
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

async def get_analyses(user_id: str) -> list:
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

        cur = await db.execute(
            "SELECT COUNT(*) as total FROM analyses WHERE user_id = ?", (user_id,)
        )
        total = (await cur.fetchone())["total"]

        cur = await db.execute(
            """SELECT AVG(match_score) as avg_score
               FROM analyses WHERE user_id = ? AND match_score IS NOT NULL""",
            (user_id,)
        )
        row = await cur.fetchone()
        avg_score = round(row["avg_score"]) if row["avg_score"] else 0

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
