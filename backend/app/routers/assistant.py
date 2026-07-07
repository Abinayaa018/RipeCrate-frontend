"""
A lightweight rule-based NLU assistant that answers questions using live
inventory data. It is intentionally dependency-free (no external LLM call)
so the feature works out of the box; swap `answer_question` internals for
a call to the Anthropic API if you want free-form conversational answers
grounded on the same data context.
"""
from collections import Counter
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.batch import ProduceBatch, BatchStatus
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])


class AssistantQuery(BaseModel):
    question: str


def _expiring_this_week(batches, days=7):
    today = date.today()
    return [b for b in batches if b.predicted_expiry_date and 0 <= (b.predicted_expiry_date - today).days <= days]


def answer_question(question: str, batches: list[ProduceBatch]) -> str:
    q = question.lower()

    if "expir" in q and ("week" in q or "soon" in q or "day" in q):
        soon = _expiring_this_week(batches)
        if not soon:
            return "No batches are currently predicted to expire within the next 7 days."
        names = ", ".join(f"{b.produce_name} ({b.batch_code}, {b.predicted_expiry_date})" for b in soon[:8])
        return f"{len(soon)} batch(es) are expiring within 7 days: {names}."

    if "wastage" in q or "wasted" in q or ("highest" in q and "warehouse" in q):
        totals = Counter()
        for b in batches:
            if b.status in (BatchStatus.CRITICAL, BatchStatus.EXPIRED):
                totals[b.warehouse_location] += b.quantity_kg
        if not totals:
            return "No significant wastage detected across warehouses right now."
        top_warehouse, kg = totals.most_common(1)[0]
        return f"{top_warehouse} currently has the highest wastage, at {kg:.0f}kg in critical/expired batches."

    if "reduce spoilage" in q or "prevent spoilage" in q or "how can i reduce" in q:
        return (
            "To reduce spoilage: keep temperature-sensitive produce in cold storage, "
            "maintain humidity in the 85-95% range for most produce, rotate stock using "
            "FIFO, prioritize selling batches with high spoilage probability first, and "
            "separate any visibly damaged produce to stop cross-contamination."
        )

    if "spoilage" in q and ("risk" in q or "probability" in q):
        risky = [b for b in batches if b.spoilage_probability and b.spoilage_probability >= 0.6]
        if not risky:
            return "No batches currently have a high spoilage probability (>=60%)."
        names = ", ".join(f"{b.produce_name} ({b.batch_code}, {b.spoilage_probability:.0%})" for b in risky[:8])
        return f"{len(risky)} batch(es) have high spoilage probability: {names}."

    if "total" in q and ("inventory" in q or "weight" in q or "stock" in q):
        total = sum(b.quantity_kg for b in batches)
        return f"Total inventory across all warehouses is {total:.0f}kg across {len(batches)} batches."

    return (
        "I can answer questions about expiring produce, warehouse wastage, spoilage risk, "
        "total inventory, and spoilage-reduction recommendations. Try asking something like "
        "\"Which produce will expire this week?\" or \"Which warehouse has the highest wastage?\""
    )


@router.post("/ask")
def ask_assistant(payload: AssistantQuery, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batches = db.query(ProduceBatch).all()
    answer = answer_question(payload.question, batches)
    return {"question": payload.question, "answer": answer}
