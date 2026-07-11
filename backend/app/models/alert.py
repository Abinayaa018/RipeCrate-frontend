import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class AlertSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertType(str, enum.Enum):
    EXPIRING_SOON = "expiring_soon"
    HUMIDITY_OUT_OF_RANGE = "humidity_out_of_range"
    TEMPERATURE_SPIKE = "temperature_spike"
    HIGH_SPOILAGE_RISK = "high_spoilage_risk"
    OVERSTOCK = "overstock"
    DUPLICATE_BATCH = "duplicate_batch"
    LOW_UTILIZATION = "low_utilization"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    message = Column(String, nullable=False)
    batch_id = Column(String, ForeignKey("produce_batches.id"), nullable=True)
    batch = relationship("ProduceBatch", back_populates="alerts")
    is_read = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
