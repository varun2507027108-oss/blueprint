import json
import sqlite3
import threading
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from config import settings

# Initialize Supabase Client
url = settings.SUPABASE_URL.strip() if settings.SUPABASE_URL else ""
# Strip trailing /rest/v1/ or /rest/v1 if present to ensure base URL is used
if url.endswith("/rest/v1/"):
    url = url[:-9]
elif url.endswith("/rest/v1"):
    url = url[:-8]

key = settings.SUPABASE_KEY.strip() if settings.SUPABASE_KEY else ""

supabase_client: Client = create_client(url, key)

# Local SQLite Fallback Setup
DB_PATH = "founder_os.db"
db_lock = threading.Lock()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                startup_name TEXT,
                idea TEXT,
                status TEXT,
                created_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS artifacts (
                session_id TEXT,
                stage_name TEXT,
                payload_json TEXT,
                version INTEGER,
                created_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS decision_log (
                session_id TEXT,
                stage_name TEXT,
                reasoning TEXT,
                created_at TEXT
            )
        """)
        conn.commit()
    finally:
        conn.close()

def serialize_dates(obj: Any) -> Any:
    """Helper to convert datetime/date objects to ISO strings for JSON serialization."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, list):
        return [serialize_dates(x) for x in obj]
    if isinstance(obj, dict):
        return {k: serialize_dates(v) for k, v in obj.items()}
    return obj

def save_session(session_id: str, startup_name: str, idea: str):
    data = {
        "session_id": session_id,
        "startup_name": startup_name,
        "idea": idea,
        "status": "running"
    }
    
    # Always attempt Supabase first
    try:
        supabase_client.table("sessions").insert(data).execute()
        print(f"Successfully saved session {session_id} to Supabase.")
    except Exception as e:
        print(f"Supabase error saving session: {e}. Falling back to SQLite.")
        # Save to SQLite fallback
        try:
            init_db()
            with db_lock:
                conn = get_db_connection()
                try:
                    conn.execute(
                        "INSERT INTO sessions (session_id, startup_name, idea, status, created_at) VALUES (?, ?, ?, ?, ?)",
                        (session_id, startup_name, idea, "running", datetime.now().isoformat())
                    )
                    conn.commit()
                finally:
                    conn.close()
            print(f"Successfully saved session {session_id} to SQLite fallback.")
        except Exception as sqle:
            print(f"Failed to save session to SQLite fallback: {sqle}")

def update_session_status(session_id: str, status: str):
    # Attempt Supabase first
    try:
        supabase_client.table("sessions").update({"status": status}).eq("session_id", session_id).execute()
        print(f"Successfully updated status to '{status}' for session {session_id} in Supabase.")
    except Exception as e:
        print(f"Supabase error updating session status: {e}. Falling back to SQLite.")
        # Fallback to SQLite
        try:
            init_db()
            with db_lock:
                conn = get_db_connection()
                try:
                    conn.execute(
                        "UPDATE sessions SET status = ? WHERE session_id = ?",
                        (status, session_id)
                    )
                    conn.commit()
                finally:
                    conn.close()
            print(f"Successfully updated status to '{status}' for session {session_id} in SQLite fallback.")
        except Exception as sqle:
            print(f"Failed to update session status in SQLite fallback: {sqle}")

def get_sessions_by_ids(session_ids: list) -> List[Dict[str, Any]]:
    if not session_ids:
        return []
    
    results = {}
    
    # Try Supabase first
    try:
        response = supabase_client.table("sessions").select("session_id, startup_name, idea, status, created_at").in_("session_id", session_ids).execute()
        for row in response.data:
            results[row["session_id"]] = {
                "session_id": row["session_id"],
                "startup_name": row["startup_name"],
                "idea": row["idea"],
                "status": row["status"],
                "created_at": row.get("created_at")
            }
    except Exception as e:
        print(f"Supabase error fetching sessions: {e}.")

    # For any missing sessions, check SQLite fallback
    missing_ids = [sid for sid in session_ids if sid not in results]
    if missing_ids:
        try:
            init_db()
            conn = get_db_connection()
            try:
                placeholders = ",".join("?" for _ in missing_ids)
                cursor = conn.execute(
                    f"SELECT session_id, startup_name, idea, status, created_at FROM sessions WHERE session_id IN ({placeholders})",
                    missing_ids
                )
                for r in cursor.fetchall():
                    results[r["session_id"]] = dict(r)
            finally:
                conn.close()
        except Exception as e:
            print(f"SQLite fallback error fetching sessions: {e}")

    # Return serialized and sorted by created_at desc
    res_list = list(results.values())
    res_list.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return serialize_dates(res_list)

def save_artifact(session_id: str, stage_name: str, payload: Dict[str, Any]) -> int:
    # Always attempt Supabase first
    try:
        # Get max version
        res = supabase_client.table("artifacts").select("version").eq("session_id", session_id).eq("stage_name", stage_name).order("version", desc=True).limit(1).execute()
        max_version = res.data[0]["version"] if res.data else 0
        new_version = max_version + 1
        
        data = {
            "session_id": session_id,
            "stage_name": stage_name,
            "payload_json": json.dumps(payload),
            "version": new_version
        }
        supabase_client.table("artifacts").insert(data).execute()
        print(f"Successfully saved artifact for stage '{stage_name}' (version {new_version}) to Supabase.")
        return new_version
    except Exception as e:
        print(f"Supabase error saving artifact: {e}. Falling back to SQLite.")
        # Fallback to SQLite
        try:
            init_db()
            with db_lock:
                conn = get_db_connection()
                try:
                    cursor = conn.execute(
                        "SELECT MAX(version) FROM artifacts WHERE session_id = ? AND stage_name = ?",
                        (session_id, stage_name)
                    )
                    row = cursor.fetchone()
                    max_version = row[0] if row and row[0] is not None else 0
                    new_version = max_version + 1
                    
                    conn.execute(
                        "INSERT INTO artifacts (session_id, stage_name, payload_json, version, created_at) VALUES (?, ?, ?, ?, ?)",
                        (session_id, stage_name, json.dumps(payload), new_version, datetime.now().isoformat())
                    )
                    conn.commit()
                    print(f"Successfully saved artifact for stage '{stage_name}' (version {new_version}) to SQLite fallback.")
                    return new_version
                finally:
                    conn.close()
        except Exception as sqle:
            print(f"Failed to save artifact to SQLite fallback: {sqle}")
            return 0

def get_latest_artifact(session_id: str, stage_name: str) -> Optional[Dict[str, Any]]:
    # Try Supabase first
    try:
        res = supabase_client.table("artifacts").select("payload_json").eq("session_id", session_id).eq("stage_name", stage_name).order("version", desc=True).limit(1).execute()
        if res.data:
            return json.loads(res.data[0]["payload_json"])
    except Exception as e:
        print(f"Supabase error fetching latest artifact: {e}.")

    # Fallback to SQLite
    try:
        init_db()
        with db_lock:
            conn = get_db_connection()
            try:
                cursor = conn.execute(
                    "SELECT payload_json FROM artifacts WHERE session_id = ? AND stage_name = ? ORDER BY version DESC LIMIT 1",
                    (session_id, stage_name)
                )
                row = cursor.fetchone()
                if row:
                    return json.loads(row["payload_json"])
            finally:
                conn.close()
    except Exception as sqle:
        print(f"SQLite fallback error fetching latest artifact: {sqle}")
    return None

def get_latest_artifact_version(session_id: str, stage_name: str) -> int:
    # Try Supabase first
    try:
        res = supabase_client.table("artifacts").select("version").eq("session_id", session_id).eq("stage_name", stage_name).order("version", desc=True).limit(1).execute()
        if res.data:
            return res.data[0]["version"]
    except Exception as e:
        print(f"Supabase error fetching latest artifact version: {e}.")

    # Fallback to SQLite
    try:
        init_db()
        with db_lock:
            conn = get_db_connection()
            try:
                cursor = conn.execute(
                    "SELECT MAX(version) FROM artifacts WHERE session_id = ? AND stage_name = ?",
                    (session_id, stage_name)
                )
                row = cursor.fetchone()
                if row and row[0] is not None:
                    return row[0]
            finally:
                conn.close()
    except Exception as sqle:
        print(f"SQLite fallback error fetching latest artifact version: {sqle}")
    return 0

def add_decision_log(session_id: str, stage_name: str, reasoning: str):
    # Try Supabase first
    try:
        data = {
            "session_id": session_id,
            "stage_name": stage_name,
            "reasoning": reasoning
        }
        supabase_client.table("decision_log").insert(data).execute()
        print(f"Successfully added decision log for stage '{stage_name}' to Supabase.")
    except Exception as e:
        print(f"Supabase error adding decision log: {e}. Falling back to SQLite.")
        # Fallback to SQLite
        try:
            init_db()
            with db_lock:
                conn = get_db_connection()
                try:
                    conn.execute(
                        "INSERT INTO decision_log (session_id, stage_name, reasoning, created_at) VALUES (?, ?, ?, ?)",
                        (session_id, stage_name, reasoning, datetime.now().isoformat())
                    )
                    conn.commit()
                    print(f"Successfully added decision log for stage '{stage_name}' to SQLite fallback.")
                finally:
                    conn.close()
        except Exception as sqle:
            print(f"Failed to add decision log to SQLite fallback: {sqle}")

def get_decision_log(session_id: str) -> List[Dict[str, Any]]:
    # Try Supabase first
    try:
        res = supabase_client.table("decision_log").select("stage_name, reasoning, created_at").eq("session_id", session_id).order("created_at", desc=False).execute()
        if res.data:
            return serialize_dates(res.data)
    except Exception as e:
        print(f"Supabase error fetching decision log: {e}.")

    # Fallback to SQLite
    try:
        init_db()
        with db_lock:
            conn = get_db_connection()
            try:
                cursor = conn.execute(
                    "SELECT stage_name, reasoning, created_at FROM decision_log WHERE session_id = ? ORDER BY created_at ASC",
                    (session_id,)
                )
                rows = cursor.fetchall()
                return serialize_dates([dict(r) for r in rows])
            finally:
                conn.close()
    except Exception as sqle:
        print(f"SQLite fallback error fetching decision logs: {sqle}")
    return []