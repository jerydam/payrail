import secrets
import hashlib
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Configuration
SECRET_KEY = "YOUR_SUPER_SECRET_BACKEND_KEY" # Change this!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 Hours

# Password Hashing Context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Password Logic ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- JWT Logic ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- API Key Logic ---
def generate_api_key():
    """Generates a raw key like sk_live_abc123..."""
    return f"sk_live_{secrets.token_urlsafe(32)}"

def hash_key(raw_key: str):
    """Hashes the key for secure storage."""
    return hashlib.sha256(raw_key.encode()).hexdigest()