import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Load variables from the .env file we created
load_dotenv()

# 2. Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 3. Validation
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env file")

# 4. Initialize the Supabase client
# This 'supabase' object will be imported by main.py and watcher.py
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 5. Optional Helper: Check connection on startup
def check_db_connection():
    try:
        # A simple query to verify the connection is alive
        supabase.table("merchants").select("count", count="exact").limit(1).execute()
        print("✅ Successfully connected to Supabase.")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")