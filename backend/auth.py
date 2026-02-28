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
