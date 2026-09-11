import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

# Handle URL prefix for SQLAlchemy if needed (postgresql:// works with psycopg2)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Clean channel_binding from URL if present since psycopg2 standard might not support channel_binding param directly
if "channel_binding=" in db_url:
    import re
    db_url = re.sub(r'[&?]channel_binding=[^&]+', '', db_url)

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    FastAPI dependency that yields a database session and closes it afterwards.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Creates all tables in Neon PostgreSQL if they do not already exist,
    and safely applies non-destructive schema migrations.
    """
    try:
        from app.db import models  # noqa: F401
        from sqlalchemy import text
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE audit_records ADD COLUMN IF NOT EXISTS related_clauses JSON;"))
            conn.execute(text("ALTER TABLE audit_records ADD COLUMN IF NOT EXISTS audit_type VARCHAR(32) DEFAULT 'TEXT';"))
            conn.commit()
        logger.info("Neon PostgreSQL tables successfully initialized and migrated.")
        print("[DATABASE] Neon PostgreSQL tables successfully initialized and migrated.")
    except Exception as e:
        logger.error(f"Failed to initialize Neon PostgreSQL tables: {e}")
        print(f"[DATABASE WARNING] Failed to initialize Neon PostgreSQL tables: {e}")
