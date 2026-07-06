"""
Loads the trained shelf-life regression and spoilage classification
pipelines produced by ml/train_model.py, and exposes a single
`predict()` function used by the /predictions router.

If the model files aren't present (e.g. fresh clone before running the
training pipeline), falls back to a transparent heuristic so the API
still works end-to-end for local development / demos.
"""
import os
from datetime import date, timedelta

import joblib
import pandas as pd

from app.config import settings

_MODELS_DIR = settings.ML_MODELS_DIR
_shelf_life_model = None
_spoilage_model = None
_models_loaded = False


def _load_models():
    global _shelf_life_model, _spoilage_model, _models_loaded
    if _models_loaded:
        return
    sl_path = os.path.join(_MODELS_DIR, "model_shelf_life.pkl")
    sp_path = os.path.join(_MODELS_DIR, "model_spoilage.pkl")
    if os.path.exists(sl_path) and os.path.exists(sp_path):
        _shelf_life_model = joblib.load(sl_path)
        _spoilage_model = joblib.load(sp_path)
    _models_loaded = True


def _heuristic_predict(payload: dict) -> tuple[float, float]:
    """Simple, explainable fallback used only when trained models are absent."""
    base_life = 14.0
    temp_penalty = abs(payload["temperature_c"] - 5) * 0.6
    humidity_penalty = abs(payload["humidity_pct"] - 90) * 0.08
    transport_penalty = payload["transportation_time_hrs"] / 24 * 1.0
    shelf_life = max(0.5, base_life - temp_penalty - humidity_penalty - transport_penalty)
    spoilage_prob = min(0.98, max(0.02, 1 - (shelf_life / base_life)))
    return round(shelf_life, 1), round(spoilage_prob, 4)


def predict(payload: dict) -> dict:
    """
    payload keys expected:
      produce_name, temperature_c, humidity_pct, packaging,
      transportation_time_hrs, storage_type, warehouse_location,
      quantity_kg, harvest_date (date)
    """
    _load_models()
    harvest_date: date = payload["harvest_date"]
    days_since_harvest = (date.today() - harvest_date).days
    days_since_harvest = max(0, days_since_harvest)

    if _shelf_life_model is not None and _spoilage_model is not None:
        row = pd.DataFrame([{
            "temperature_c": payload["temperature_c"],
            "humidity_pct": payload["humidity_pct"],
            "days_since_harvest": days_since_harvest,
            "transportation_time_hrs": payload["transportation_time_hrs"],
            "weight_kg": payload["quantity_kg"],
            "produce": payload["produce_name"],
            "storage_type": payload["storage_type"],
            "packaging": payload["packaging"],
            "warehouse": payload["warehouse_location"],
        }])
        shelf_life_days = float(max(0.2, _shelf_life_model.predict(row)[0]))
        spoilage_prob = float(_spoilage_model.predict_proba(row)[0][1])
        confidence = float(max(_spoilage_model.predict_proba(row)[0]))
    else:
        shelf_life_days, spoilage_prob = _heuristic_predict(payload)
        confidence = 0.65  # lower confidence for heuristic fallback

    if spoilage_prob >= 0.66:
        risk_level = "High"
    elif spoilage_prob >= 0.33:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    estimated_expiry_date = date.today() + timedelta(days=round(shelf_life_days))

    return {
        "predicted_shelf_life_days": round(shelf_life_days, 1),
        "spoilage_probability": round(spoilage_prob, 4),
        "confidence_score": round(confidence, 4),
        "risk_level": risk_level,
        "estimated_expiry_date": estimated_expiry_date,
        "using_trained_model": _shelf_life_model is not None,
    }
