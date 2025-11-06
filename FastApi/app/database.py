# ...existing code...
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

load_dotenv()  # carga .env de la raíz

# Prefer DATABASE_URL si la defines, si no la construimos desde las variables separadas (Postgres)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = os.getenv("DATABASE_USER", "postgres")
    password = os.getenv("DATABASE_PASSWORD", "0509")
    host = os.getenv("DATABASE_HOST", "localhost")
    port = os.getenv("DATABASE_PORT", "5432")
    dbname = os.getenv("DATABASE_NAME", "ev2-frontend")
    DATABASE_URL = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no está configurada en .env y no se pudo construir a partir de variables.")

# Para Postgres no se requieren connect_args especiales
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()
# permitir ignorar anotaciones legacy que no usan Mapped[]
Base.__allow_unmapped__ = True

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ...existing code...