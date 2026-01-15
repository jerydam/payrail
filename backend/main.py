import uuid
import os
import json
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware # <--- Critical Import
from pydantic import BaseModel
from jose import JWTError, jwt
from web3 import Web3 

# Import from your local modules
from database import supabase
from security import (
    get_password_hash, verify_password, create_access_token, 
    generate_api_key, hash_key, SECRET_KEY, ALGORITHM
)

app = FastAPI()

# ==========================================
#  CORS CONFIGURATION (MUST BE HERE)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows ALL origins (Frontend, Postman, etc.)
    allow_credentials=True,
    allow_methods=["*"], # Allows ALL methods (POST, GET, OPTIONS, PUT)
    allow_headers=["*"], # Allows ALL headers
)
# ==========================================

# --- Blockchain Config ---
RPC_URL = os.getenv("RPC_URL") 
ENGINE_ADDRESS = os.getenv("ENGINE_ADDRESS")
# Minimal ABI for getDepositAddress
ENGINE_ABI = '[{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_planId","type":"uint256"}],"name":"getDepositAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]'

# Initialize Web3 (Wrap in try/except to prevent crash if ENV is missing)
try:
    if RPC_URL and ENGINE_ADDRESS:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        contract = w3.eth.contract(address=ENGINE_ADDRESS, abi=json.loads(ENGINE_ABI))
    else:
        print("⚠️ Warning: RPC_URL or ENGINE_ADDRESS not set. Blockchain features will fail.")
        w3 = None
        contract = None
except Exception as e:
    print(f"⚠️ Blockchain Init Error: {e}")
    w3 = None

# --- Security Schemes ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
api_key_header = APIKeyHeader(name="X-Payrail-Secret", auto_error=False)

# --- Pydantic Models ---
class UserRegister(BaseModel):
    email: str
    password: str
    business_name: str
    treasury_address: str

class UserLogin(BaseModel):
    email: str
    password: str

# --- Auth Endpoints ---
@app.post("/auth/signup")
async def signup(user_data: UserRegister):
    # 1. Check if email exists
    existing = supabase.table("users").select("id").eq("email", user_data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create User
    user_id = str(uuid.uuid4())
    hashed_pwd = get_password_hash(user_data.password)
    
    supabase.table("users").insert({
        "id": user_id,
        "email": user_data.email,
        "password_hash": hashed_pwd,
        "role": "merchant"
    }).execute()

    # 3. Generate API Keys
    raw_api_key = generate_api_key()
    raw_webhook_secret = f"whsec_{uuid.uuid4().hex}"
    
    # 4. Create Merchant Profile
    supabase.table("merchants").insert({
        "user_id": user_id,
        "name": user_data.business_name,
        "treasury_address": user_data.treasury_address,
        "api_key_hash": hash_key(raw_api_key),
        "webhook_secret": raw_webhook_secret,
        "total_revenue": 0
    }).execute()

    # 5. Return Token & Secrets
    token = create_access_token({"sub": user_id})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "api_key": raw_api_key, 
        "webhook_secret": raw_webhook_secret
    }

@app.post("/auth/login")
async def login(credentials: UserLogin):
    response = supabase.table("users").select("*").eq("email", credentials.email).execute()
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = response.data[0]
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token({"sub": user['id']})
    return {"access_token": token, "token_type": "bearer"}

# --- Middleware / Dependencies ---
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validates JWT for Dashboard Access"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

async def get_merchant_api(api_key: str = Security(api_key_header)):
    """Validates API Key for Server-to-Server requests"""
    if not api_key: 
        raise HTTPException(status_code=403, detail="Missing API Key")
    
    hashed = hash_key(api_key)
    result = supabase.table("merchants").select("*").eq("api_key_hash", hashed).execute()
    
    if not result.data:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return result.data[0]

# --- Protected Routes ---

@app.get("/merchants/me")
async def read_users_me(user_id: str = Depends(get_current_user)):
    data = supabase.table("merchants").select("*").eq("user_id", user_id).single().execute()
    return data.data

@app.get("/vaults/predict")
async def predict_vault(user_wallet: str, plan_id: int, merchant: dict = Depends(get_merchant_api)):
    if not w3 or not contract:
        raise HTTPException(status_code=503, detail="Blockchain service unavailable")
        
    try:
        # 1. Call Smart Contract to get the deterministic address
        checksum_wallet = Web3.to_checksum_address(user_wallet)
        
        predicted_addr = contract.functions.getDepositAddress(checksum_wallet, plan_id).call()
        
        # 2. Store in DB for the Watcher
        supabase.table("vaults").upsert({
            "address": predicted_addr,
            "user_wallet": checksum_wallet,
            "merchant_id": merchant['id'],
            "plan_id": plan_id,
            "status": "PENDING"
        }).execute()
        
        return {"vault_address": predicted_addr}
        
    except Exception as e:
        print(f"Error predicting vault: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate vault address")