"""
Seeds the database with a demo user and a realistic set of produce batches
so the dashboard/analytics/alerts screens have data immediately.

Run:
    python seed.py
"""
import random
import uuid
from datetime import date, timedelta

from app.database import Base, engine, SessionLocal
from app import models  # noqa: F401
from app.models.user import User, UserRole
from app.models.batch import ProduceBatch, StorageType, BatchStatus
from app.security import hash_password
from app.services import ml_service

Base.metadata.create_all(bind=engine)

PRODUCE = ["Tomato", "Banana", "Apple", "Lettuce", "Potato", "Onion", "Mango",
           "Spinach", "Carrot", "Strawberry", "Grapes", "Cabbage", "Orange", "Cucumber", "Avocado"]
WAREHOUSES = ["Warehouse North", "Warehouse South", "Warehouse East", "Warehouse West", "Central Distribution Hub"]
PACKAGING = ["Crate", "Ventilated Box", "Vacuum Sealed", "Plastic Wrap", "Mesh Bag", "Cardboard Box"]
STORAGE_TYPES = list(StorageType)


def seed():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@ripecrate.io").first()
        if not admin:
            admin = User(
                full_name="Admin User",
                email="admin@ripecrate.io",
                hashed_password=hash_password("Admin@123"),
                role=UserRole.ADMIN,
                organization="RipeCrate Demo Org",
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("Created demo admin -> admin@ripecrate.io / Admin@123")

        existing_count = db.query(ProduceBatch).count()
        if existing_count > 0:
            print(f"{existing_count} batches already exist — skipping batch seeding.")
            return

        for _ in range(120):
            produce = random.choice(PRODUCE)
            storage_type = random.choice(STORAGE_TYPES)
            harvest_date = date.today() - timedelta(days=random.randint(0, 14))
            arrival_date = harvest_date + timedelta(days=random.randint(0, 3))
            temperature = round(random.uniform(-2, 25), 1)
            humidity = round(random.uniform(50, 98), 1)
            quantity = round(random.uniform(50, 800), 1)
            warehouse = random.choice(WAREHOUSES)
            packaging = random.choice(PACKAGING)

            batch = ProduceBatch(
                batch_code=f"BATCH-{uuid.uuid4().hex[:8].upper()}",
                produce_name=produce,
                quantity_kg=quantity,
                harvest_date=harvest_date,
                arrival_date=arrival_date,
                storage_type=storage_type,
                temperature_c=temperature,
                humidity_pct=humidity,
                packaging=packaging,
                warehouse_location=warehouse,
                supplier=f"{produce} Farms Co.",
                owner_id=admin.id,
            )

            prediction = ml_service.predict({
                "produce_name": produce,
                "harvest_date": harvest_date,
                "temperature_c": temperature,
                "humidity_pct": humidity,
                "packaging": packaging,
                "transportation_time_hrs": random.uniform(1, 48),
                "storage_type": storage_type.value,
                "warehouse_location": warehouse,
                "quantity_kg": quantity,
            })
            batch.predicted_shelf_life_days = prediction["predicted_shelf_life_days"]
            batch.current_shelf_life_days = prediction["predicted_shelf_life_days"]
            batch.spoilage_probability = prediction["spoilage_probability"]
            batch.confidence_score = prediction["confidence_score"]
            batch.predicted_expiry_date = prediction["estimated_expiry_date"]
            batch.status = (
                BatchStatus.CRITICAL if prediction["risk_level"] == "High"
                else BatchStatus.AT_RISK if prediction["risk_level"] == "Medium"
                else BatchStatus.HEALTHY
            )
            db.add(batch)

        db.commit()
        print("Seeded 120 demo produce batches.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
