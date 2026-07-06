from datetime import date
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    produce_name: str
    harvest_date: date
    temperature_c: float
    humidity_pct: float
    packaging: str
    transportation_time_hrs: float
    storage_type: str
    warehouse_location: str
    quantity_kg: float


class RecommendationItem(BaseModel):
    title: str
    reason: str
    priority: str


class PredictionResponse(BaseModel):
    predicted_shelf_life_days: float
    spoilage_probability: float
    confidence_score: float
    risk_level: str
    estimated_expiry_date: date
    recommendations: list[RecommendationItem]
