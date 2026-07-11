from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.user import User
from app.services.alert_service import evaluate_batches_and_create_alerts
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
def list_alerts(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Alert)
    if unread_only:
        query = query.filter(Alert.is_read.is_(False))
    alerts = query.order_by(Alert.created_at.desc()).limit(100).all()
    return alerts


@router.post("/evaluate")
def evaluate_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Runs the rule engine across all batches and inserts any new alerts found.
    In production this would run on a scheduled job (e.g. Celery beat / cron)."""
    new_alerts = evaluate_batches_and_create_alerts(db)
    return {"created": len(new_alerts)}


@router.patch("/{alert_id}/read")
def mark_alert_read(alert_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.is_read = True
    db.commit()
    return alert


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.is_read = True
    alert.resolved = True
    db.commit()
    return {"id": alert_id, "resolved": True}


@router.post("/resolve-all")
def resolve_all_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = db.query(Alert).filter(Alert.is_read.is_(False)).all()
    for a in updated:
        a.is_read = True
        a.resolved = True
    db.commit()
    return {"resolved": len(updated)}
