from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database_config import Base, engine
from auth import auth_routes
from api import analytics, research, user_routes

app = FastAPI(
    title="Research App"
)

origins = [

]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*']
)

# @app.on_event("startup")
# def start_up():
#     Base.metadata.create_all(bind=engine)

Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(research.router)
app.include_router(user_routes.router)
app.include_router(analytics.router)