from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.batch import ProduceBatch, BatchStatus
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batches = db.query(ProduceBatch).all()
    total_produce = len(set(b.produce_name for b in batches))
    total_batches = len(batches)
    total_weight = sum(b.quantity_kg for b in batches)

    shelf_lives = [b.current_shelf_life_days for b in batches if b.current_shelf_life_days is not None]
    avg_shelf_life = round(sum(shelf_lives) / len(shelf_lives), 1) if shelf_lives else 0

    today = date.today()
    near_expiry = [b for b in batches if b.predicted_expiry_date and 0 <= (b.predicted_expiry_date - today).days <= 3]

    spoilage_probs = [b.spoilage_probability for b in batches if b.spoilage_probability is not None]
    todays_spoilage_risk = round(sum(spoilage_probs) / len(spoilage_probs), 4) if spoilage_probs else 0

    status_counts = {status.value: 0 for status in BatchStatus}
    for b in batches:
        status_counts[b.status.value] += 1

    unread_alerts = db.query(Alert).filter(Alert.is_read.is_(False)).count()

    # Simple storage utilization proxy: total weight / assumed warehouse capacity
    ASSUMED_CAPACITY_KG = 20000
    warehouses = set(b.warehouse_location for b in batches)
    utilization_by_warehouse = {}
    for w in warehouses:
        w_weight = sum(b.quantity_kg for b in batches if b.warehouse_location == w)
        utilization_by_warehouse[w] = round(min(100, (w_weight / ASSUMED_CAPACITY_KG) * 100), 1)

    return {
        "total_produce_types": total_produce,
        "total_batches": total_batches,
        "total_inventory_weight_kg": round(total_weight, 1),
        "average_shelf_life_remaining_days": avg_shelf_life,
        "todays_spoilage_risk": todays_spoilage_risk,
        "produce_near_expiry_count": len(near_expiry),
        "produce_near_expiry": [
            {"batch_code": b.batch_code, "produce_name": b.produce_name,
             "expiry_date": b.predicted_expiry_date, "warehouse": b.warehouse_location}
            for b in near_expiry[:10]
        ],
        "status_breakdown": status_counts,
        "storage_utilization_by_warehouse": utilization_by_warehouse,
        "unread_alerts": unread_alerts,
    }


@router.get("/temperature-humidity-trend")
def temperature_humidity_trend(days: int = 14, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns a synthetic-but-representative trend built from current batch conditions.
    In a production system this would query a time-series table of sensor readings.
    """
    batches = db.query(ProduceBatch).all()
    if not batches:
        return {"trend": []}

    avg_temp = sum(b.temperature_c for b in batches) / len(batches)
    avg_humidity = sum(b.humidity_pct for b in batches) / len(batches)

    trend = []
    for i in range(days, 0, -1):
        d = date.today() - timedelta(days=i)
        # deterministic pseudo-variation so the chart looks alive without randomness each call
        wobble = ((i * 37) % 10 - 5) * 0.3
        trend.append({
            "date": d.isoformat(),
            "temperature_c": round(avg_temp + wobble, 1),
            "humidity_pct": round(avg_humidity + wobble * 1.5, 1),
        })
    return {"trend": trend}


@router.get("/recent-activity")
def recent_activity(limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batches = (
        db.query(ProduceBatch)
        .order_by(ProduceBatch.updated_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "batch_code": b.batch_code,
            "produce_name": b.produce_name,
            "warehouse": b.warehouse_location,
            "status": b.status.value,
            "updated_at": b.updated_at,
        }
        for b in batches
    ]
