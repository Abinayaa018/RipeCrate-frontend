"""
Model loader and prediction helpers used by the API router.

This module supports multiple model layouts for backwards compatibility:
- `app.ml_models/model_shelf_life.pkl` + `model_spoilage.pkl` (legacy)
- `ml/models/best_model.joblib` (new training pipeline)

If only a shelf-life regression model is available, we compute a
simple spoilage probability from the predicted shelf life for now.
"""
import json
import os
from datetime import date, timedelta
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

from app.config import settings


_MODELS_DIR = settings.ML_MODELS_DIR
_shelf_life_model = None
_spoilage_model = None
_models_loaded = False


def _load_models():
    """Attempt to load models from several known locations."""
    global _shelf_life_model, _spoilage_model, _models_loaded
    if _models_loaded:
        return

    # 1) Legacy layout from settings.ML_MODELS_DIR
    sl_path = Path(_MODELS_DIR) / "model_shelf_life.pkl"
    sp_path = Path(_MODELS_DIR) / "model_spoilage.pkl"
    if sl_path.exists() and sp_path.exists():
        _shelf_life_model = joblib.load(sl_path)
        _spoilage_model = joblib.load(sp_path)
        _models_loaded = True
        return

    # 2) New training location: repository ml/models/best_model.joblib
    repo_root = Path(__file__).resolve().parents[2]
    candidate = repo_root / "ml" / "models" / "best_model.joblib"
    if candidate.exists():
        try:
            _shelf_life_model = joblib.load(candidate)
            _spoilage_model = None
            _models_loaded = True
            return
        except Exception:
            pass

    # 3) settings ML_MODELS_DIR best_model.joblib
    candidate2 = Path(_MODELS_DIR) / "best_model.joblib"
    if candidate2.exists():
        try:
            _shelf_life_model = joblib.load(candidate2)
            _spoilage_model = None
            _models_loaded = True
            return
        except Exception:
            pass

    _models_loaded = True


def _heuristic_predict(payload: dict) -> tuple[float, float]:
    """Simple explainable fallback used when trained models are absent."""
    base_life = 14.0
    temp_penalty = abs(payload.get("temperature_c", 5) - 5) * 0.6
    humidity_penalty = abs(payload.get("humidity_pct", 90) - 90) * 0.08
    transport_penalty = payload.get("transportation_time_hrs", 0) / 24 * 1.0
    shelf_life = max(0.5, base_life - temp_penalty - humidity_penalty - transport_penalty)
    spoilage_prob = min(0.98, max(0.02, 1 - (shelf_life / base_life)))
    return round(shelf_life, 1), round(spoilage_prob, 4)


def predict(payload: dict) -> dict:
    """Return prediction dictionary used by the `/api/predictions` router.

    Expects harvest_date as a `datetime.date` instance.
    """
    _load_models()
    harvest_date: date = payload.get("harvest_date")
    if isinstance(harvest_date, str):
        try:
            harvest_date = date.fromisoformat(harvest_date)
        except Exception:
            harvest_date = date.today()

    days_since_harvest = (date.today() - harvest_date).days if harvest_date else 0
    days_since_harvest = max(0, days_since_harvest)

    row = pd.DataFrame([{
        "temperature_c": payload.get("temperature_c", 5.0),
        "humidity_pct": payload.get("humidity_pct", 90.0),
        "days_since_harvest": days_since_harvest,
        "transportation_time_hrs": payload.get("transportation_time_hrs", 0.0),
        "weight_kg": payload.get("quantity_kg", 0.0),
        "produce": payload.get("produce_name", "unknown"),
        "storage_type": payload.get("storage_type", "ambient"),
        "packaging": payload.get("packaging", "none"),
        "warehouse": payload.get("warehouse_location", "unknown"),
    }])

    if _shelf_life_model is not None:
        # Ensure DataFrame contains all columns expected by the model's preprocessor
        try:
            pre = _shelf_life_model.named_steps.get("pre")
        except Exception:
            pre = None

        if pre is not None and hasattr(pre, "transformers_"):
            expected_cols = []
            numeric_cols = set()
            cat_cols = set()
            for name, transformer, cols in pre.transformers_:
                # cols may be a list of column names
                if isinstance(cols, (list, tuple)) and all(isinstance(c, str) for c in cols):
                    expected_cols.extend(cols)
                    # classify numeric vs categorical by transformer type
                    from sklearn.preprocessing import StandardScaler

                    if isinstance(transformer, StandardScaler) or transformer.__class__.__name__.lower().startswith("standard"):
                        numeric_cols.update(cols)
                    else:
                        # assume remaining are categorical (OneHotEncoder or similar)
                        cat_cols.update(cols)

            # Add any missing expected columns with sensible defaults
            for c in expected_cols:
                if c not in row.columns:
                    if c in numeric_cols:
                        row[c] = 0.0
                    else:
                        row[c] = "__missing__"

            # Reorder columns to expected (ColumnTransformer will align but keeping order helps)
            try:
                row = row[expected_cols]
            except Exception:
                pass

        try:
            shelf_life_days = float(max(0.2, _shelf_life_model.predict(row)[0]))
        except Exception:
            shelf_life_days = float(max(0.2, _shelf_life_model.predict(row.values)[0]))
        # If we don't have a spoilage classifier, derive a simple spoilage prob
        spoilage_prob = min(0.98, max(0.02, 1 - (shelf_life_days / 30)))
        confidence = 0.8
    else:
        shelf_life_days, spoilage_prob = _heuristic_predict(payload)
        confidence = 0.65

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
