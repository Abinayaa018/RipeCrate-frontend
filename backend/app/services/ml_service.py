"""
ML service — loads spoilage_classifier.joblib + shelf_life_regressor.joblib
produced by ml/train_model.py and maps API request fields to dataset features.

Feature mapping (API → dataset):
  temperature_c        → storage_temp
  humidity_pct         → (not directly in dataset; used for heuristic adjustment)
  days_since_harvest   → days_remaining_at_purchase (inverted proxy)
  transportation_time_hrs → distribution_hours
  packaging            → packaging_score (ordinal)
  storage_type         → (affects temp_deviation proxy)
  produce_name         → category (mapped)
  warehouse_location   → region (mapped)
  quantity_kg          → (not a model feature; used for context only)
"""
import json
from datetime import date, timedelta
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd

from app.config import settings

_MODELS_DIR = Path(settings.ML_MODELS_DIR)
_clf = None          # spoilage classifier pipeline
_reg = None          # shelf-life regressor pipeline
_meta: dict = {}
_loaded = False

# ── Ordinal maps ──────────────────────────────────────────────────────────────
_PACKAGING_SCORE = {
    "ventilated crate": 6, "map sealed": 9, "wax carton": 7,
    "reusable tote": 5, "none": 3,
}
_PRODUCE_CATEGORY = {
    "tomatoes": "vegetables", "berries": "fruits", "strawberries": "fruits",
    "leafy greens": "vegetables", "avocados": "fruits", "dairy": "dairy",
    "mangoes": "fruits", "unknown": "vegetables",
}
_REGION_MAP = {
    "north hub": "north", "south vault": "south", "east cold": "east",
    "port gate": "west", "retail dock": "north", "eu relay": "east",
    "unknown": "north",
}
_QUALITY_GRADE = {"A": "A", "B": "B", "C": "C"}


def _resolve_models_dir() -> Path:
    """Try settings path first, then repo-relative ml/models."""
    p = _MODELS_DIR
    if (p / "spoilage_classifier.joblib").exists():
        return p
    repo_root = Path(__file__).resolve().parents[2]
    alt = repo_root / "ml" / "models"
    if (alt / "spoilage_classifier.joblib").exists():
        return alt
    return p


def _load():
    global _clf, _reg, _meta, _loaded
    if _loaded:
        return
    _loaded = True
    d = _resolve_models_dir()
    clf_path = d / "spoilage_classifier.joblib"
    reg_path = d / "shelf_life_regressor.joblib"
    meta_path = d / "model_meta.json"
    try:
        if clf_path.exists():
            _clf = joblib.load(clf_path)
        if reg_path.exists():
            _reg = joblib.load(reg_path)
        if meta_path.exists():
            with open(meta_path) as f:
                _meta = json.load(f)
    except Exception as exc:
        print(f"[ml_service] model load warning: {exc}")


def _build_row(payload: dict) -> pd.DataFrame:
    """Convert API payload dict → single-row DataFrame matching training features."""
    temp = float(payload.get("temperature_c", 5.0))
    humidity = float(payload.get("humidity_pct", 90.0))
    transport_hrs = float(payload.get("transportation_time_hrs", 0.0))
    packaging_raw = str(payload.get("packaging", "none")).lower()
    produce_raw = str(payload.get("produce_name", "unknown")).lower()
    warehouse_raw = str(payload.get("warehouse_location", "unknown")).lower()
    storage_type = str(payload.get("storage_type", "ambient")).lower()

    harvest_date = payload.get("harvest_date")
    if isinstance(harvest_date, str):
        try:
            harvest_date = date.fromisoformat(harvest_date)
        except Exception:
            harvest_date = date.today()
    days_since = max(0, (date.today() - harvest_date).days) if harvest_date else 0

    # Derive dataset features
    ideal_temp = 4.0 if "cold" in storage_type or "refrigerat" in storage_type else 8.0
    temp_deviation = abs(temp - ideal_temp)
    packaging_score = _PACKAGING_SCORE.get(packaging_raw, 5)
    handling_score = max(1, 10 - round(transport_hrs / 4))
    shelf_life_days_base = max(1, 14 - days_since)
    days_remaining = max(0, shelf_life_days_base - days_since // 2)
    spoilage_sensitivity = min(10, max(1, round(temp_deviation * 1.2 + (humidity - 90) * 0.1 + 3)))
    distribution_hours = transport_hrs
    daily_demand = 50.0
    demand_variability = 0.2
    supplier_score = 7.5
    today = date.today()
    day_of_week = today.weekday()
    is_weekend = int(day_of_week >= 5)
    month = today.month
    temp_abuse_events = int(temp_deviation > 3)

    category = _PRODUCE_CATEGORY.get(produce_raw, "vegetables")
    region = _REGION_MAP.get(warehouse_raw, "north")
    quality_grade = "B"

    return pd.DataFrame([{
        "storage_temp": temp,
        "temp_deviation": temp_deviation,
        "spoilage_sensitivity": spoilage_sensitivity,
        "temp_abuse_events": temp_abuse_events,
        "distribution_hours": distribution_hours,
        "handling_score": handling_score,
        "packaging_score": packaging_score,
        "shelf_life_days": shelf_life_days_base,
        "days_remaining_at_purchase": days_remaining,
        "daily_demand": daily_demand,
        "demand_variability": demand_variability,
        "supplier_score": supplier_score,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "month": month,
        "category": category,
        "region": region,
        "quality_grade": quality_grade,
    }])


def _heuristic(payload: dict) -> tuple[float, float, float]:
    """Fallback when models are not loaded."""
    temp = float(payload.get("temperature_c", 5.0))
    humidity = float(payload.get("humidity_pct", 90.0))
    transport = float(payload.get("transportation_time_hrs", 0.0))
    base = 14.0
    shelf = max(0.5, base - abs(temp - 5) * 0.6 - abs(humidity - 90) * 0.08 - transport / 24)
    spoilage = min(0.97, max(0.03, 1 - shelf / base))
    return round(shelf, 1), round(spoilage, 4), 0.62


def predict(payload: dict) -> dict:
    _load()
    row = _build_row(payload)

    if _clf is not None and _reg is not None:
        try:
            spoilage_proba = float(_clf.predict_proba(row)[0][1])
            shelf_life = float(max(0.5, _reg.predict(row)[0]))
            # Confidence = 1 - entropy of classifier output
            p = np.clip(spoilage_proba, 1e-6, 1 - 1e-6)
            entropy = -(p * np.log(p) + (1 - p) * np.log(1 - p))
            confidence = round(float(1 - entropy / np.log(2)), 4)
            using_model = True
        except Exception as exc:
            print(f"[ml_service] predict error: {exc}")
            shelf_life, spoilage_proba, confidence = _heuristic(payload)
            using_model = False
    elif _reg is not None:
        try:
            shelf_life = float(max(0.5, _reg.predict(row)[0]))
            spoilage_proba = min(0.97, max(0.03, 1 - shelf_life / 30))
            confidence = 0.78
            using_model = True
        except Exception:
            shelf_life, spoilage_proba, confidence = _heuristic(payload)
            using_model = False
    else:
        shelf_life, spoilage_proba, confidence = _heuristic(payload)
        using_model = False

    if spoilage_proba >= 0.66:
        risk_level = "High"
    elif spoilage_proba >= 0.33:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    expiry = date.today() + timedelta(days=round(shelf_life))

    return {
        "predicted_shelf_life_days": round(shelf_life, 1),
        "spoilage_probability": round(spoilage_proba, 4),
        "confidence_score": round(confidence, 4),
        "risk_level": risk_level,
        "estimated_expiry_date": expiry,
        "using_trained_model": using_model,
    }
