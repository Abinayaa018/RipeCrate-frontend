from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.prediction import PredictionRequest, PredictionResponse, RecommendationItem
from app.services import ml_service
from app.services.recommendation_engine import generate_recommendations
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/predictions", tags=["AI Prediction"])


@router.post("", response_model=PredictionResponse)
def predict_shelf_life(payload: PredictionRequest, current_user: User = Depends(get_current_user)):
    input_dict = payload.model_dump()
    prediction = ml_service.predict(input_dict)
    recommendations = generate_recommendations(input_dict, prediction)

    return PredictionResponse(
        predicted_shelf_life_days=prediction["predicted_shelf_life_days"],
        spoilage_probability=prediction["spoilage_probability"],
        confidence_score=prediction["confidence_score"],
        risk_level=prediction["risk_level"],
        estimated_expiry_date=prediction["estimated_expiry_date"],
        recommendations=[RecommendationItem(**r) for r in recommendations],
    )
