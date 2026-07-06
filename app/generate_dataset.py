"""
RipeCrate — Synthetic Dataset Generator
Generates a realistic synthetic dataset of produce batches for training
shelf-life / spoilage prediction models.

Run:
    python generate_dataset.py --rows 60000 --out dataset.csv
"""
import argparse
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

RNG = np.random.default_rng(42)

# Base shelf life (days) under ideal storage (cold, ~90% humidity) per produce type
PRODUCE_PROFILES = {
    "Tomato":      {"base_shelf_life": 14, "ideal_temp": 10, "ideal_humidity": 90, "temp_sensitivity": 1.4, "weight_range": (5, 25)},
    "Banana":      {"base_shelf_life": 7,  "ideal_temp": 13, "ideal_humidity": 90, "temp_sensitivity": 1.8, "weight_range": (10, 20)},
    "Apple":       {"base_shelf_life": 60, "ideal_temp": 2,  "ideal_humidity": 92, "temp_sensitivity": 0.7, "weight_range": (10, 30)},
    "Lettuce":     {"base_shelf_life": 10, "ideal_temp": 2,  "ideal_humidity": 95, "temp_sensitivity": 1.6, "weight_range": (2, 10)},
    "Potato":      {"base_shelf_life": 90, "ideal_temp": 7,  "ideal_humidity": 85, "temp_sensitivity": 0.5, "weight_range": (20, 50)},
    "Onion":       {"base_shelf_life": 120,"ideal_temp": 5,  "ideal_humidity": 65, "temp_sensitivity": 0.4, "weight_range": (15, 40)},
    "Mango":       {"base_shelf_life": 12, "ideal_temp": 13, "ideal_humidity": 90, "temp_sensitivity": 1.5, "weight_range": (8, 20)},
    "Spinach":     {"base_shelf_life": 6,  "ideal_temp": 1,  "ideal_humidity": 95, "temp_sensitivity": 2.0, "weight_range": (1, 5)},
    "Carrot":      {"base_shelf_life": 45, "ideal_temp": 1,  "ideal_humidity": 95, "temp_sensitivity": 0.6, "weight_range": (10, 30)},
    "Strawberry":  {"base_shelf_life": 5,  "ideal_temp": 1,  "ideal_humidity": 90, "temp_sensitivity": 2.2, "weight_range": (2, 8)},
    "Grapes":      {"base_shelf_life": 21, "ideal_temp": 0,  "ideal_humidity": 90, "temp_sensitivity": 1.1, "weight_range": (5, 15)},
    "Cabbage":     {"base_shelf_life": 60, "ideal_temp": 1,  "ideal_humidity": 95, "temp_sensitivity": 0.6, "weight_range": (10, 25)},
    "Orange":      {"base_shelf_life": 35, "ideal_temp": 5,  "ideal_humidity": 90, "temp_sensitivity": 0.8, "weight_range": (10, 25)},
    "Cucumber":    {"base_shelf_life": 12, "ideal_temp": 11, "ideal_humidity": 90, "temp_sensitivity": 1.3, "weight_range": (5, 15)},
    "Avocado":     {"base_shelf_life": 8,  "ideal_temp": 5,  "ideal_humidity": 90, "temp_sensitivity": 1.7, "weight_range": (4, 12)},
}

STORAGE_TYPES = ["Cold Storage", "Refrigerated", "Ambient", "Controlled Atmosphere", "Ventilated Dry Storage"]
PACKAGING_TYPES = ["Crate", "Ventilated Box", "Vacuum Sealed", "Plastic Wrap", "Mesh Bag", "Cardboard Box"]
WAREHOUSES = ["Warehouse North", "Warehouse South", "Warehouse East", "Warehouse West", "Central Distribution Hub"]

STORAGE_HUMIDITY_MODIFIER = {
    "Cold Storage": 0, "Refrigerated": -2, "Ambient": -15,
    "Controlled Atmosphere": 3, "Ventilated Dry Storage": -20,
}
PACKAGING_SHELF_LIFE_MODIFIER = {
    "Crate": 0, "Ventilated Box": 2, "Vacuum Sealed": 5,
    "Plastic Wrap": 1, "Mesh Bag": -1, "Cardboard Box": 0,
}


def generate_row(row_id: int):
    produce = RNG.choice(list(PRODUCE_PROFILES.keys()))
    profile = PRODUCE_PROFILES[produce]

    storage_type = RNG.choice(STORAGE_TYPES)
    packaging = RNG.choice(PACKAGING_TYPES)
    warehouse = RNG.choice(WAREHOUSES)

    # Temperature: mostly near-ideal, with realistic drift/noise
    temp_noise = RNG.normal(0, 4)
    temperature = round(profile["ideal_temp"] + temp_noise, 1)

    # Humidity: influenced by storage type
    humidity_base = profile["ideal_humidity"] + STORAGE_HUMIDITY_MODIFIER[storage_type]
    humidity = round(np.clip(humidity_base + RNG.normal(0, 5), 20, 100), 1)

    days_since_harvest = int(RNG.integers(0, 15))
    transportation_time = round(RNG.uniform(0.5, 72), 1)  # hours
    weight = round(RNG.uniform(*profile["weight_range"]), 1)

    # --- Shelf life model ---
    temp_deviation = abs(temperature - profile["ideal_temp"])
    humidity_deviation = abs(humidity - profile["ideal_humidity"])

    shelf_life = profile["base_shelf_life"]
    shelf_life -= temp_deviation * profile["temp_sensitivity"]
    shelf_life -= humidity_deviation * 0.15
    shelf_life -= days_since_harvest * 0.6
    shelf_life -= (transportation_time / 24) * 0.8
    shelf_life += PACKAGING_SHELF_LIFE_MODIFIER[packaging]
    shelf_life += RNG.normal(0, 1.2)  # natural noise
    shelf_life = max(0.2, shelf_life)

    actual_shelf_life = round(shelf_life, 1)

    # --- Spoilage probability model (logistic-ish, driven by shelf life ratio) ---
    life_ratio = actual_shelf_life / profile["base_shelf_life"]
    spoilage_score = 1 / (1 + np.exp((life_ratio - 0.35) * 8))
    spoilage_score = float(np.clip(spoilage_score + RNG.normal(0, 0.05), 0, 1))
    spoilage = 1 if spoilage_score > 0.5 else 0

    harvest_date = datetime.now() - timedelta(days=days_since_harvest)
    expiry_date = harvest_date + timedelta(days=actual_shelf_life)

    return {
        "batch_id": f"BATCH-{row_id:07d}",
        "produce": produce,
        "temperature_c": temperature,
        "humidity_pct": humidity,
        "storage_type": storage_type,
        "packaging": packaging,
        "days_since_harvest": days_since_harvest,
        "transportation_time_hrs": transportation_time,
        "weight_kg": weight,
        "warehouse": warehouse,
        "actual_shelf_life_days": actual_shelf_life,
        "spoilage": spoilage,
        "spoilage_probability": round(spoilage_score, 4),
        "harvest_date": harvest_date.date().isoformat(),
        "expiry_date": expiry_date.date().isoformat(),
    }


def generate_dataset(n_rows: int) -> pd.DataFrame:
    rows = [generate_row(i) for i in range(1, n_rows + 1)]
    return pd.DataFrame(rows)


def inject_missing_values(df: pd.DataFrame, frac: float = 0.02) -> pd.DataFrame:
    """Inject a small amount of realistic missingness to mimic real-world sensor data."""
    df = df.copy()
    for col in ["humidity_pct", "transportation_time_hrs"]:
        mask = RNG.random(len(df)) < frac
        df.loc[mask, col] = np.nan
    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=60000)
    parser.add_argument("--out", type=str, default="dataset.csv")
    args = parser.parse_args()

    df = generate_dataset(args.rows)
    df = inject_missing_values(df)
    df.to_csv(args.out, index=False)
    print(f"Generated {len(df):,} rows -> {args.out}")
    print(df.head())
    print("\nSpoilage rate:", df["spoilage"].mean().round(3))
