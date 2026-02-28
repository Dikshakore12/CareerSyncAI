# backend/ai_logic.py
import os
import re
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

SYSTEM_PROMPT = """You are CareerSync AI, an advanced AI-powered Career Intelligence and Resume-Job Matchmaking System.

Your primary objective is to analyze resumes and job descriptions intelligently, calculate compatibility, detect skill gaps, and provide structured career guidance.

===============================
OUTPUT FORMAT (STRICT - always follow this exactly)
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
- Match Score must be a realistic integer (0-100) based on actual overlap
- Use emoji headers exactly as shown
- Be specific, professional, and concise
- No exaggeration or flattery
"""


def build_chain():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables.")

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=api_key,
        openai_api_base=base_url,
        temperature=0.4,
        max_tokens=2048,
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{user_input}")
    ])

    chain = prompt | llm | StrOutputParser()
    return chain


# Build once at module load
_chain = build_chain()


def extract_match_score(text: str):
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
            return line[:100]
    return "Unknown Position"


def analyze_career_match(
    resume_text: str,
    job_description: str,
    request_cover_letter: bool = False
):
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
        print(f"LangChain/OpenAI Error: {e}")
        return (f"⚠ AI service error: {str(e)}", None)
