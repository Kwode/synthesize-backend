from pydantic import BaseModel
from datetime import datetime

class AnalyticsResponse(BaseModel):

    total_users: int
    total_researches: int
    average_attempts: float
    latest_research: datetime