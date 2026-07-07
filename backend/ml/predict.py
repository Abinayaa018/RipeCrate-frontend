"""Simple CLI to run a single prediction using the trained model.

Usage examples:
  python ml/predict.py --file sample.json
  python ml/predict.py --example
"""
from pathlib import Path
import json
import sys
from datetime import date

import joblib

MODEL_DIR = Path(__file__).resolve().parent / "models"
DEFAULT_MODEL = MODEL_DIR / "best_model.joblib"

SAMPLE_PAYLOAD = {
    "produce_name": "apple",
    "temperature_c": 4.0,
    "humidity_pct": 92.0,
    "packaging": "plastic",
    "transportation_time_hrs": 12,
    "storage_type": "refrigerated",
    "warehouse_location": "local",
    "quantity_kg": 100,
    "harvest_date": date.today().isoformat(),
}


def load_model(path: Path = DEFAULT_MODEL):
    if path.exists():
        return joblib.load(path)
    raise FileNotFoundError("Model not found. Run ml/train_model.py first.")


def predict(model, payload: dict):
    # minimal wrapper - align dataframe columns to what model expects
    from pandas import DataFrame
    row = DataFrame([{
        "temperature_c": payload.get("temperature_c", 5.0),
        "humidity_pct": payload.get("humidity_pct", 90.0),
        "days_since_harvest": 0,
        "transportation_time_hrs": payload.get("transportation_time_hrs", 0.0),
        "weight_kg": payload.get("quantity_kg", 0.0),
        "produce": payload.get("produce_name", "unknown"),
        "storage_type": payload.get("storage_type", "ambient"),
        "packaging": payload.get("packaging", "none"),
        "warehouse": payload.get("warehouse_location", "unknown"),
    }])
    pred = model.predict(row)
    return float(pred[0])


if __name__ == "__main__":
    model = load_model()
    if "--example" in sys.argv:
        payload = SAMPLE_PAYLOAD
    elif "--file" in sys.argv:
        idx = sys.argv.index("--file") + 1
        with open(sys.argv[idx], "r", encoding="utf8") as f:
            payload = json.load(f)
    else:
        payload = SAMPLE_PAYLOAD
    out = predict(model, payload)
    print(json.dumps({"predicted_shelf_life_days": out}, indent=2))
