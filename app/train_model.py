"""
RipeCrate — Model Training Pipeline

Trains two model families to predict:
  1. actual_shelf_life_days (regression)
  2. spoilage (classification)

Compares Random Forest vs XGBoost, reports MAE / RMSE / R2 (regression) and
Accuracy / F1 (classification), and persists the best-performing pipeline
(preprocessing + model) to disk for the FastAPI backend to load.

Run:
    python train_model.py --data dataset.csv
"""
import argparse
import json
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings("ignore")

try:
    from xgboost import XGBRegressor, XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("[warn] xgboost not installed — falling back to sklearn GradientBoosting "
          "for the comparison. Install `xgboost` for the real XGBoost model.")
    from sklearn.ensemble import GradientBoostingRegressor as XGBRegressor
    from sklearn.ensemble import GradientBoostingClassifier as XGBClassifier

NUMERIC_FEATURES = [
    "temperature_c", "humidity_pct", "days_since_harvest",
    "transportation_time_hrs", "weight_kg",
]
CATEGORICAL_FEATURES = ["produce", "storage_type", "packaging", "warehouse"]


def _make_boosted_regressor():
    if XGBOOST_AVAILABLE:
        return XGBRegressor(
            n_estimators=300, max_depth=6, learning_rate=0.08,
            subsample=0.9, colsample_bytree=0.9, random_state=42,
        )
    return XGBRegressor(
        n_estimators=300, max_depth=6, learning_rate=0.08,
        subsample=0.9, random_state=42,
    )


def _make_boosted_classifier():
    if XGBOOST_AVAILABLE:
        return XGBClassifier(
            n_estimators=300, max_depth=6, learning_rate=0.08,
            subsample=0.9, colsample_bytree=0.9, random_state=42,
            eval_metric="logloss",
        )
    return XGBClassifier(
        n_estimators=300, max_depth=6, learning_rate=0.08,
        subsample=0.9, random_state=42,
    )


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])
    return ColumnTransformer([
        ("num", numeric_pipeline, NUMERIC_FEATURES),
        ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
    ])


def train_regression(X_train, X_test, y_train, y_test, preprocessor):
    results = {}
    models = {
        "RandomForest": RandomForestRegressor(
            n_estimators=200, max_depth=14, min_samples_leaf=3,
            random_state=42, n_jobs=-1,
        ),
        "XGBoost": _make_boosted_regressor(),
    }
    fitted = {}
    for name, model in models.items():
        pipe = Pipeline([("preprocess", preprocessor), ("model", model)])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        results[name] = {
            "MAE": round(mean_absolute_error(y_test, preds), 4),
            "RMSE": round(np.sqrt(mean_squared_error(y_test, preds)), 4),
            "R2": round(r2_score(y_test, preds), 4),
        }
        fitted[name] = pipe
    return results, fitted


def train_classification(X_train, X_test, y_train, y_test, preprocessor):
    results = {}
    models = {
        "RandomForest": RandomForestClassifier(
            n_estimators=200, max_depth=12, min_samples_leaf=3,
            random_state=42, n_jobs=-1,
        ),
        "XGBoost": _make_boosted_classifier(),
    }
    fitted = {}
    for name, model in models.items():
        pipe = Pipeline([("preprocess", preprocessor), ("model", model)])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        results[name] = {
            "Accuracy": round(accuracy_score(y_test, preds), 4),
            "F1": round(f1_score(y_test, preds), 4),
        }
        fitted[name] = pipe
    return results, fitted


def main(data_path: str):
    df = pd.read_csv(data_path)
    feature_cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES

    X = df[feature_cols]
    y_shelf_life = df["actual_shelf_life_days"]
    y_spoilage = df["spoilage"]

    X_train, X_test, y_sl_train, y_sl_test, y_sp_train, y_sp_test = train_test_split(
        X, y_shelf_life, y_spoilage, test_size=0.2, random_state=42,
    )

    print("Training shelf-life regression models...")
    reg_results, reg_models = train_regression(
        X_train, X_test, y_sl_train, y_sl_test, build_preprocessor()
    )

    print("Training spoilage classification models...")
    clf_results, clf_models = train_classification(
        X_train, X_test, y_sp_train, y_sp_test, build_preprocessor()
    )

    best_reg_name = min(reg_results, key=lambda k: reg_results[k]["MAE"])
    best_clf_name = max(clf_results, key=lambda k: clf_results[k]["F1"])

    best_reg_model = reg_models[best_reg_name]
    best_clf_model = clf_models[best_clf_name]

    joblib.dump(best_reg_model, "model_shelf_life.pkl")
    joblib.dump(best_clf_model, "model_spoilage.pkl")

    comparison = {
        "shelf_life_regression": reg_results,
        "spoilage_classification": clf_results,
        "best_shelf_life_model": best_reg_name,
        "best_spoilage_model": best_clf_name,
        "xgboost_available": XGBOOST_AVAILABLE,
        "feature_columns": feature_cols,
    }
    with open("model_comparison.json", "w") as f:
        json.dump(comparison, f, indent=2)

    print("\n=== Shelf Life Regression ===")
    print(json.dumps(reg_results, indent=2))
    print("\n=== Spoilage Classification ===")
    print(json.dumps(clf_results, indent=2))
    print(f"\nBest shelf-life model: {best_reg_name} -> model_shelf_life.pkl")
    print(f"Best spoilage model:   {best_clf_name} -> model_spoilage.pkl")
    print("Saved comparison metrics -> model_comparison.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="dataset.csv")
    args = parser.parse_args()
    main(args.data)
