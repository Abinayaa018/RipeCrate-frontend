import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Date, DateTime, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class StorageType(str, enum.Enum):
    COLD_STORAGE = "Cold Storage"
    REFRIGERATED = "Refrigerated"
    AMBIENT = "Ambient"
    CONTROLLED_ATMOSPHERE = "Controlled Atmosphere"
    VENTILATED_DRY_STORAGE = "Ventilated Dry Storage"


class BatchStatus(str, enum.Enum):
    HEALTHY = "healthy"
    AT_RISK = "at_risk"
    CRITICAL = "critical"
    EXPIRED = "expired"


class ProduceBatch(Base):
    __tablename__ = "produce_batches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_code = Column(String, unique=True, index=True, nullable=False)
    produce_name = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    harvest_date = Column(Date, nullable=False)
    arrival_date = Column(Date, nullable=False)
    storage_type = Column(Enum(StorageType), nullable=False)
    temperature_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    packaging = Column(String, nullable=False)
    warehouse_location = Column(String, nullable=False)
    supplier = Column(String, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    predicted_shelf_life_days = Column(Float, nullable=True)
    current_shelf_life_days = Column(Float, nullable=True)
    spoilage_probability = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    predicted_expiry_date = Column(Date, nullable=True)
    status = Column(Enum(BatchStatus), nullable=False, default=BatchStatus.HEALTHY)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="batches")
    alerts = relationship("Alert", back_populates="batch")
