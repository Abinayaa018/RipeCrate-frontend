import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.batch import ProduceBatch, BatchStatus
from app.models.user import User
from app.schemas.batch import BatchCreate, BatchUpdate, BatchOut, PaginatedBatches
from app.services import ml_service
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


def _run_prediction_for_batch(batch: ProduceBatch):
    prediction = ml_service.predict({
        "produce_name": batch.produce_name,
        "harvest_date": batch.harvest_date,
        "temperature_c": batch.temperature_c,
        "humidity_pct": batch.humidity_pct,
        "packaging": batch.packaging,
        "transportation_time_hrs": 12.0,  # not tracked post-arrival; assume nominal
        "storage_type": batch.storage_type.value,
        "warehouse_location": batch.warehouse_location,
        "quantity_kg": batch.quantity_kg,
    })
    batch.predicted_shelf_life_days = prediction["predicted_shelf_life_days"]
    batch.current_shelf_life_days = prediction["predicted_shelf_life_days"]
    batch.spoilage_probability = prediction["spoilage_probability"]
    batch.confidence_score = prediction["confidence_score"]
    batch.predicted_expiry_date = prediction["estimated_expiry_date"]

    if prediction["risk_level"] == "High":
        batch.status = BatchStatus.CRITICAL
    elif prediction["risk_level"] == "Medium":
        batch.status = BatchStatus.AT_RISK
    else:
        batch.status = BatchStatus.HEALTHY


@router.post("", response_model=BatchOut, status_code=201)
def create_batch(payload: BatchCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batch = ProduceBatch(
        batch_code=f"BATCH-{uuid.uuid4().hex[:8].upper()}",
        owner_id=current_user.id,
        **payload.model_dump(),
    )
    _run_prediction_for_batch(batch)
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.get("", response_model=PaginatedBatches)
def list_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = Query(None, description="Search by produce name or batch code"),
    produce_type: str | None = None,
    warehouse: str | None = None,
    storage_type: str | None = None,
    status_filter: BatchStatus | None = Query(None, alias="status"),
    expiring_within_days: int | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
):
    query = db.query(ProduceBatch)

    if search:
        like = f"%{search}%"
        query = query.filter(or_(ProduceBatch.produce_name.ilike(like), ProduceBatch.batch_code.ilike(like)))
    if produce_type:
        query = query.filter(ProduceBatch.produce_name == produce_type)
    if warehouse:
        query = query.filter(ProduceBatch.warehouse_location == warehouse)
    if storage_type:
        query = query.filter(ProduceBatch.storage_type == storage_type)
    if status_filter:
        query = query.filter(ProduceBatch.status == status_filter)
    if expiring_within_days is not None:
        cutoff = date.today() + timedelta(days=expiring_within_days)
        query = query.filter(ProduceBatch.predicted_expiry_date <= cutoff)

    total = query.count()

    sort_column = getattr(ProduceBatch, sort_by, ProduceBatch.created_at)
    query = query.order_by(sort_column.desc() if sort_dir == "desc" else sort_column.asc())

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedBatches(items=items, total=total, page=page, page_size=page_size)


@router.get("/{batch_id}", response_model=BatchOut)
def get_batch(batch_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batch = db.query(ProduceBatch).filter(ProduceBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")
    return batch


@router.put("/{batch_id}", response_model=BatchOut)
def update_batch(batch_id: str, payload: BatchUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batch = db.query(ProduceBatch).filter(ProduceBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(batch, field, value)

    # Re-run prediction if any condition-affecting field changed
    if any(f in update_data for f in ("temperature_c", "humidity_pct", "storage_type", "packaging")):
        _run_prediction_for_batch(batch)

    db.commit()
    db.refresh(batch)
    return batch


@router.delete("/{batch_id}", status_code=204)
def delete_batch(batch_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batch = db.query(ProduceBatch).filter(ProduceBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")
    db.delete(batch)
    db.commit()
    return None
