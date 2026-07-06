from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.batch import StorageType, BatchStatus


class BatchCreate(BaseModel):
    produce_name: str
    quantity_kg: float = Field(gt=0)
    harvest_date: date
    arrival_date: date
    storage_type: StorageType
    temperature_c: float
    humidity_pct: float = Field(ge=0, le=100)
    packaging: str
    warehouse_location: str
    supplier: str | None = None


class BatchUpdate(BaseModel):
    produce_name: str | None = None
    quantity_kg: float | None = None
    storage_type: StorageType | None = None
    temperature_c: float | None = None
    humidity_pct: float | None = None
    packaging: str | None = None
    warehouse_location: str | None = None
    supplier: str | None = None
    status: BatchStatus | None = None


class BatchOut(BaseModel):
    id: str
    batch_code: str
    produce_name: str
    quantity_kg: float
    harvest_date: date
    arrival_date: date
    storage_type: StorageType
    temperature_c: float
    humidity_pct: float
    packaging: str
    warehouse_location: str
    supplier: str | None
    current_shelf_life_days: float | None
    predicted_shelf_life_days: float | None
    spoilage_probability: float | None
    confidence_score: float | None
    predicted_expiry_date: date | None
    status: BatchStatus
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class PaginatedBatches(BaseModel):
    items: list[BatchOut]
    total: int
    page: int
    page_size: int
