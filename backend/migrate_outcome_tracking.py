import asyncio
import os
import sys
import socket

# --- MONKEY PATCH TO BYPASS LOCAL DNS (Errno 11001 Fix) ---
_original_getaddrinfo = socket.getaddrinfo

def patched_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if "neon.tech" in host:
        # Hardcoding the explicitly resolved IPs since local DNS refuses queries
        resolved_ip = "3.137.42.68"
        # Return a constructed address tuple that matches getaddrinfo format
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', (resolved_ip, port))]
    return _original_getaddrinfo(host, port, family, type, proto, flags)

socket.getaddrinfo = patched_getaddrinfo
# -----------------------------------------------------------

# Ensure backend directory is on the path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database import engine
from sqlalchemy import text

async def main():
    print("Creating outcome_tracking table...")
    try:
        async with engine.begin() as conn:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS outcome_tracking (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    clerk_user_id VARCHAR REFERENCES users(clerk_user_id) ON DELETE SET NULL,
                    scheme_id INTEGER REFERENCES schemes(id) ON DELETE SET NULL,
                    draft_generated BOOLEAN DEFAULT FALSE,
                    draft_date TIMESTAMP,
                    submitted BOOLEAN DEFAULT FALSE,
                    submit_date TIMESTAMP,
                    approved BOOLEAN,
                    amount_approved INTEGER,
                    reported_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_outcome_tracking_user
                ON outcome_tracking(clerk_user_id);
            """))
        print("✅ outcome_tracking table and index created successfully.")
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
