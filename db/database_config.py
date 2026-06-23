from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from supabase import Client, create_client
import os

load_dotenv()

DATABASE_URL = "postgresql://postgres.ijmzwotouowvakfchxdd:#Girlpower4life@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"

engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True, connect_args={"sslmode": "require"})

SessionLocal = sessionmaker(autoflush=False, autocommit= False, bind=engine)

Base = declarative_base()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

supabase: Client = create_client(
    supabase_url=supabase_url,
    supabase_key=supabase_key
)