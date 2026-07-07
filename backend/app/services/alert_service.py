from collections import Counter
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.alert import Alert, AlertType, AlertSeverity
from app.models.batch import ProduceBatch

HUMIDITY_RANGE = (70, 95)
TEMP_SPIKE_THRESHOLD = 15
HIGH_SPOILAGE_THRESHOLD = 0.65
OVERSTOCK_KG_THRESHOLD = 5000
LOW_UTILIZATION_BATCH_COUNT = 2


def evaluate_batches_and_create_alerts(db: Session) -> list[Alert]:
    """Scans all active batches and inserts new alerts for conditions detected.
    Idempotent-ish: does a simple existing-message check to avoid flooding duplicates
    within the same day."""
    batches = db.query(ProduceBatch).all()
    new_alerts: list[Alert] = []
    today = date.today()

    # Duplicate batch detection (same produce + warehouse + arrival date)
    seen = Counter()
    for b in batches:
        key = (b.produce_name, b.warehouse_location, b.arrival_date)
        seen[key] += 1

    warehouse_totals = Counter()
    for b in batches:
        warehouse_totals[b.warehouse_location] += b.quantity_kg

    for b in batches:
        if b.predicted_expiry_date and 0 <= (b.predicted_expiry_date - today).days <= 2:
            new_alerts.append(_make_alert(
                db, AlertType.EXPIRING_SOON, AlertSeverity.WARNING,
                f"Batch {b.batch_code} ({b.produce_name}) expires within 2 days.", b.id,
            ))

        if not (HUMIDITY_RANGE[0] <= b.humidity_pct <= HUMIDITY_RANGE[1]):
            new_alerts.append(_make_alert(
                db, AlertType.HUMIDITY_OUT_OF_RANGE, AlertSeverity.WARNING,
                f"Batch {b.batch_code} humidity ({b.humidity_pct}%) is out of the safe range.", b.id,
            ))

        if b.temperature_c >= TEMP_SPIKE_THRESHOLD:
            new_alerts.append(_make_alert(
                db, AlertType.TEMPERATURE_SPIKE, AlertSeverity.CRITICAL,
                f"Temperature spike detected for batch {b.batch_code}: {b.temperature_c}°C.", b.id,
            ))

        if b.spoilage_probability and b.spoilage_probability >= HIGH_SPOILAGE_THRESHOLD:
            new_alerts.append(_make_alert(
                db, AlertType.HIGH_SPOILAGE_RISK, AlertSeverity.CRITICAL,
                f"Batch {b.batch_code} has a high spoilage probability "
                f"({b.spoilage_probability:.0%}).", b.id,
            ))

        key = (b.produce_name, b.warehouse_location, b.arrival_date)
        if seen[key] > 1:
            new_alerts.append(_make_alert(
                db, AlertType.DUPLICATE_BATCH, AlertSeverity.INFO,
                f"Possible duplicate batch detected for {b.produce_name} at "
                f"{b.warehouse_location} arriving {b.arrival_date}.", b.id,
            ))

    for warehouse, total in warehouse_totals.items():
        if total >= OVERSTOCK_KG_THRESHOLD:
            new_alerts.append(_make_alert(
                db, AlertType.OVERSTOCK, AlertSeverity.WARNING,
                f"{warehouse} is overstocked: {total:.0f}kg currently held.", None,
            ))
        batch_count = sum(1 for b in batches if b.warehouse_location == warehouse)
        if 0 < batch_count <= LOW_UTILIZATION_BATCH_COUNT:
            new_alerts.append(_make_alert(
                db, AlertType.LOW_UTILIZATION, AlertSeverity.INFO,
                f"{warehouse} has low storage utilization ({batch_count} active batches).", None,
            ))

    db.add_all(new_alerts)
    db.commit()
    return new_alerts


def _make_alert(db: Session, type_: AlertType, severity: AlertSeverity, message: str, batch_id: str | None) -> Alert:
    return Alert(type=type_, severity=severity, message=message, batch_id=batch_id)
