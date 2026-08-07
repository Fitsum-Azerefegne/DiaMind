"""
Authentication helpers: password hashing (never store plain passwords) and
JWT tokens (a signed, tamper-proof string the frontend holds onto after login
to prove "I'm still logged in" on every request, without the server needing
to remember a session).

SECRET_KEY: in a real deployed app this MUST come from an environment variable,
never hardcoded. For local development this is fine, but change it before you
ever deploy this publicly.
"""
import os
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = os.environ.get("DIAMIND_SECRET_KEY", "dev-only-secret-change-before-deploying")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# Using the bcrypt library directly (not via passlib) -- passlib's bcrypt
# wrapper has a known compatibility bug with recent bcrypt versions.
BCRYPT_MAX_BYTES = 72  # bcrypt's own hard limit on input length


def hash_password(password: str) -> str:
    truncated = password.encode("utf-8")[:BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(truncated, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password.encode("utf-8")[:BCRYPT_MAX_BYTES]
    return bcrypt.checkpw(truncated, hashed_password.encode("utf-8"))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
