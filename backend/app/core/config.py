import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

class Settings(BaseSettings):
    PROJECT_NAME: str = "ManakSetu Engine"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    STANDARDS_MASTER_PATH: Path = DATA_DIR / "standards_master.json"
    QCO_MASTER_PATH: Path = DATA_DIR / "qco_master.json"
    FOREIGN_MAPPING_PATH: Path = DATA_DIR / "foreign_mapping.json"
    CVC_RULES_PATH: Path = DATA_DIR / "cvc_rules.json"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

    # Model / Engine Settings
    BM25_TOP_K: int = 5
    SIMILARITY_THRESHOLD: float = 0.65
    RATE_LIMIT_PER_MINUTE: int = 60

    # Database Settings (Neon PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_OFS9yfko1ZEb@ep-polished-brook-b3ew6lbn-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
