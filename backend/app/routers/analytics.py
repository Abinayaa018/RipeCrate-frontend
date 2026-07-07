from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.batch import ProduceBatch, BatchStatus
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

# Rough per-kg assumptions used to translate spoilage into business metrics.
AVG_PRICE_PER_KG = 1.8       # USD
CO2_KG_PER_KG_WASTED = 2.5   # kg CO2e per kg of food waste (rough proxy)


@router.get("/overview")
def analytics_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batches = db.query(ProduceBatch).all()

    # Inventory distribution by produce
    inventory_distribution = defaultdict(float)
    for b in batches:
        inventory_distribution[b.produce_name] += b.quantity_kg

    # Most wasted produce = highest weight among CRITICAL/EXPIRED status
    wastage_by_produce = defaultdict(float)
    for b in batches:
        if b.status in (BatchStatus.CRITICAL, BatchStatus.EXPIRED):
            wastage_by_produce[b.produce_name] += b.quantity_kg

    # Warehouse comparison: total weight + avg spoilage probability
    warehouse_stats = defaultdict(lambda: {"total_weight_kg": 0.0, "spoilage_sum": 0.0, "count": 0})
    for b in batches:
        stats = warehouse_stats[b.warehouse_location]
        stats["total_weight_kg"] += b.quantity_kg
        stats["spoilage_sum"] += b.spoilage_probability or 0
        stats["count"] += 1

    warehouse_comparison = [
        {
            "warehouse": w,
            "total_weight_kg": round(s["total_weight_kg"], 1),
            "avg_spoilage_probability": round(s["spoilage_sum"] / s["count"], 4) if s["count"] else 0,
            "batch_count": s["count"],
        }
        for w, s in warehouse_stats.items()
    ]

    # Shelf life distribution buckets
    buckets = {"0-2 days": 0, "3-7 days": 0, "8-14 days": 0, "15-30 days": 0, "30+ days": 0}
    for b in batches:
        sl = b.current_shelf_life_days or 0
        if sl <= 2:
            buckets["0-2 days"] += 1
        elif sl <= 7:
            buckets["3-7 days"] += 1
        elif sl <= 14:
            buckets["8-14 days"] += 1
        elif sl <= 30:
            buckets["15-30 days"] += 1
        else:
            buckets["30+ days"] += 1

    total_wasted_kg = sum(wastage_by_produce.values())
    financial_loss_prevented = 0.0
    healthy_or_at_risk_saved_kg = sum(
        b.quantity_kg for b in batches if b.status in (BatchStatus.HEALTHY, BatchStatus.AT_RISK)
    )
    # "Prevented" framed as: weight successfully moved out of critical risk via recommendations
    financial_loss_prevented = round(healthy_or_at_risk_saved_kg * AVG_PRICE_PER_KG * 0.1, 2)
    carbon_emission_savings_kg = round(healthy_or_at_risk_saved_kg * CO2_KG_PER_KG_WASTED * 0.1, 1)

    # Monthly wastage (last 6 months, based on arrival_date of wasted batches)
    monthly_wastage = defaultdict(float)
    for b in batches:
        if b.status in (BatchStatus.CRITICAL, BatchStatus.EXPIRED):
            month_key = b.arrival_date.strftime("%Y-%m")
            monthly_wastage[month_key] += b.quantity_kg

    return {
        "inventory_distribution": dict(inventory_distribution),
        "most_wasted_produce": sorted(
            [{"produce": k, "wasted_kg": round(v, 1)} for k, v in wastage_by_produce.items()],
            key=lambda x: x["wasted_kg"], reverse=True,
        )[:10],
        "warehouse_comparison": warehouse_comparison,
        "shelf_life_distribution": buckets,
        "monthly_wastage": dict(sorted(monthly_wastage.items())),
        "total_wasted_kg": round(total_wasted_kg, 1),
        "financial_loss_prevented_usd": financial_loss_prevented,
        "carbon_emission_savings_kg": carbon_emission_savings_kg,
    }
