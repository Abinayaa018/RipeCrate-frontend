"""Model training script for RipeCrate.

This script detects a suitable target column from the dataset and trains
either a classification or regression model (Random Forest and XGBoost if
available). The best model is serialized to `ml/models/best_model.joblib`.
"""

from pathlib import Path
import json
import sys
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_squared_error

try:
    import xgboost as xgb  # optional
    XGB_AVAILABLE = True
except Exception:
    XGB_AVAILABLE = False


MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_DATA = Path(__file__).resolve().parent / "datasets" / "raw" / "perishable_goods_management.csv"
MAX_ROWS = 20000


def detect_target(df: pd.DataFrame) -> Optional[str]:
    candidates = [
        "target",
        "label",
        "is_spoiled",
        "spoiled",
        "spoiled_flag",
        "quality",
        "shelf_life",
        "days_to_spoil",
        "days_to_expire",
        "days_until_spoil",
        "remaining_days",
    ]
    cols = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand in cols:
            return cols[cand]
    # fallback: try to find a numeric column with a sensible name
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]) and "id" not in col.lower() and "count" not in col.lower():
            return col
    return None


def build_preprocessor(df: pd.DataFrame):
    numeric_cols = list(df.select_dtypes(include=[np.number]).columns)
    cat_cols = list(df.select_dtypes(include=[object, "category"]).columns)

    # Remove target if present (caller must ensure target removed)
    transformers = []
    if numeric_cols:
        transformers.append(("num", StandardScaler(), numeric_cols))
    if cat_cols:
        # Use `sparse_output=False` for recent scikit-learn; falls back in older releases
        try:
            transformers.append(("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols))
        except TypeError:
            transformers.append(("cat", OneHotEncoder(handle_unknown="ignore", sparse=False), cat_cols))

    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")
    return preprocessor


def train_model(data_path: Path = DEFAULT_DATA, out_dir: Path = MODEL_DIR) -> dict:
    df = pd.read_csv(data_path)
    print(f"Loaded data: {df.shape[0]} rows, {df.shape[1]} columns")

    target = detect_target(df)
    if not target:
        raise RuntimeError(f"Could not detect a target column. Columns: {list(df.columns)}")

    print(f"Detected target column: {target}")

    # Basic cleaning
    df = df.copy()
    # Downsample large datasets to avoid memory exhaustion during local training
    if len(df) > MAX_ROWS:
        print(f"Dataset has {len(df)} rows; sampling {MAX_ROWS} rows for local training")
        df = df.sample(n=MAX_ROWS, random_state=42)
    # Drop obvious ID columns
    drop_cols = [c for c in df.columns if c.lower().endswith("id") and c.lower() != target.lower()]
    if drop_cols:
        df.drop(columns=drop_cols, inplace=True)

    y = df[target]
    X = df.drop(columns=[target])

    # Fill missing numeric values with median; for categoricals fill with 'missing'
    for c in X.select_dtypes(include=[np.number]).columns:
        if X[c].isna().any():
            X[c] = X[c].fillna(X[c].median())
    for c in X.select_dtypes(include=[object, "category"]).columns:
        if X[c].isna().any():
            X[c] = X[c].fillna("__missing__")

    n_unique = y.nunique()
    # Treat as classification only for low-cardinality targets (<=20 classes) or booleans
    is_classification = pd.api.types.is_bool_dtype(y) or (
        n_unique <= 20 and (pd.api.types.is_integer_dtype(y) or pd.api.types.is_object_dtype(y))
    )
    print(f"Target unique values: {n_unique}; treating as {'classification' if is_classification else 'regression'}")
    if pd.api.types.is_object_dtype(y) and is_classification:
        # try to cast to int if possible
        try:
            y = y.astype(int)
        except Exception:
            pass

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = build_preprocessor(X_train)

    candidates = []

    # Use smaller, constrained models to reduce memory and CPU usage for local runs
    if is_classification:
        candidates.append(("rf", RandomForestClassifier(n_estimators=50, max_depth=12, random_state=42)))
        if XGB_AVAILABLE:
            candidates.append(("xgb", xgb.XGBClassifier(n_estimators=50, max_depth=8, use_label_encoder=False, eval_metric="logloss")))
    else:
        candidates.append(("rf", RandomForestRegressor(n_estimators=50, max_depth=12, random_state=42)))
        if XGB_AVAILABLE:
            candidates.append(("xgb", xgb.XGBRegressor(n_estimators=50, max_depth=8)))

    results = {}
    best_name = None
    best_score = None
    best_model = None

    for name, model in candidates:
        pipe = Pipeline([("pre", preprocessor), ("m", model)])
        print(f"Training {name}...")
        try:
            pipe.fit(X_train, y_train)
        except MemoryError:
            print(f"MemoryError while training {name}; skipping this model")
            continue
        preds = pipe.predict(X_test)
        if is_classification:
            score = accuracy_score(y_test, preds)
            print(f"{name} accuracy: {score:.4f}")
        else:
            rmse = mean_squared_error(y_test, preds, squared=False)
            score = -rmse  # higher is better
            print(f"{name} RMSE: {rmse:.4f}")

        results[name] = {"score": float(score)}
        if best_score is None or score > best_score:
            best_score = score
            best_name = name
            best_model = pipe

    out_model_path = out_dir / "best_model.joblib"
    print(f"Saving best model ({best_name}) to {out_model_path}")
    joblib.dump(best_model, out_model_path)
    meta = {"model": str(out_model_path.name), "best": best_name, "results": results}
    with open(out_dir / "model_meta.json", "w", encoding="utf8") as f:
        json.dump(meta, f, indent=2)

    return meta


if __name__ == "__main__":
    data = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DATA
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else MODEL_DIR
    meta = train_model(data, out)
    print("Training complete. Summary:")
    print(json.dumps(meta, indent=2))
