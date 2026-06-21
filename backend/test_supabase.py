import sys
import os
import uuid
from supabase import create_client

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import settings

url = settings.SUPABASE_URL.strip() if settings.SUPABASE_URL else ""
if url.endswith("/rest/v1/"):
    url = url[:-9]
elif url.endswith("/rest/v1"):
    url = url[:-8]

key = settings.SUPABASE_KEY.strip() if settings.SUPABASE_KEY else ""
supabase_client = create_client(url, key)

email = f"test_{uuid.uuid4().hex[:8]}@gmail.com"
password = "super-secret-password-123"

print("Trying sign up with email:", email)
try:
    auth_res = supabase_client.auth.sign_up({"email": email, "password": password})
    print("Sign up success:", auth_res)
    
    # Try insert under authenticated session
    print("Trying insert with authenticated session...")
    data = {
        "session_id": "test-uuid-auth-" + uuid.uuid4().hex[:8],
        "startup_name": "TestStartup",
        "idea": "TestIdea",
        "status": "running"
    }
    res = supabase_client.table("sessions").insert(data).execute()
    print("Insert success:", res.data)
except Exception as e:
    print("Error:")
    import traceback
    traceback.print_exc()
