"""Evaluate the trained model on the dataset and print metrics.

Usage:
    python ml/evaluate.py [path/to/dataset.csv]

Outputs RMSE (regression) or accuracy (classification) depending on target.
"""
from pathlib import Path
import json
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, accuracy_score

MODEL_DIR = Path(__file__).resolve().parent / "models"
DEFAULT_DATA = Path(__file__).resolve().parent / "datasets" / "raw" / "perishable_goods_management.csv"


def load_model():
    candidate = MODEL_DIR / "best_model.joblib"
    if candidate.exists():
        return joblib.load(candidate)
    raise FileNotFoundError("best_model.joblib not found in ml/models")


def detect_target(df: pd.DataFrame):
    for cand in ["shelf_life_days", "shelf_life", "target", "label"]:
        if cand in df.columns:
            return cand
    # fallback
    return df.columns[-1]


def evaluate(data_path: Path = DEFAULT_DATA):
    df = pd.read_csv(data_path)
    model = load_model()
    target = detect_target(df)
    print(f"Using target column: {target}")
    X = df.drop(columns=[target])
    y = df[target]

    # minimal preprocessing: fillna
    for c in X.select_dtypes(include=[np.number]).columns:
        X[c] = X[c].fillna(X[c].median())
    for c in X.select_dtypes(include=[object, "category"]).columns:
        X[c] = X[c].fillna("__missing__")

    preds = model.predict(X)
    if y.dtype.kind in "iub":
        rmse = mean_squared_error(y, preds, squared=False)
        print(f"RMSE: {rmse:.4f}")
        return {"rmse": float(rmse)}
    else:
        acc = accuracy_score(y, preds)
        print(f"Accuracy: {acc:.4f}")
        return {"accuracy": float(acc)}


if __name__ == "__main__":
    data = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DATA
    evaluate(data)
