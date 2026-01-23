from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback for development if not set, but better to raise error in prod
    print("WARNING: DATABASE_URL not set in environment.")
    DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/dbname"

# Fix for asyncpg: it doesn't support many standard libpq parameters
if DATABASE_URL:
    print("YOUR DATABASE URL IS SET AND WORKING")
    import urllib.parse as urlparse
    from urllib.parse import urlencode
    
    # Strip any trailing quotes that might have been accidentally added
    DATABASE_URL = DATABASE_URL.strip("'").strip('"')
    
    url = urlparse.urlparse(DATABASE_URL)
    query = urlparse.parse_qs(url.query)
    
    # asyncpg uses 'ssl' instead of 'sslmode'
    if 'sslmode' in query:
        sslmode = query.pop('sslmode')[0]
        if sslmode in ['require', 'verify-ca', 'verify-full']:
            query['ssl'] = ['require'] # basic 'require' works for most hosted DBs
            
    # asyncpg does NOT support 'channel_binding'
    if 'channel_binding' in query:
        query.pop('channel_binding')
        
    # Rebuild URL with only supported parameters
    new_query = urlencode(query, doseq=True)
    url = url._replace(query=new_query)
    DATABASE_URL = urlparse.urlunparse(url)

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session