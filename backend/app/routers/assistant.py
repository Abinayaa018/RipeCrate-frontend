"""
Rule-based NLU assistant with rich keyword matching across 14 intents.
Swap `answer_question` internals for an LLM call if desired — the data
context (batches) is already assembled here.
"""
from collections import Counter, defaultdict
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


# ── helpers ───────────────────────────────────────────────────────────────────

def _days_left(b: ProduceBatch) -> int:
    if not b.predicted_expiry_date:
        return 999
    return (b.predicted_expiry_date - date.today()).days


def _expiring_within(batches, days: int):
    return [b for b in batches if 0 <= _days_left(b) <= days]


def _critical(batches):
    return [b for b in batches if b.status in (BatchStatus.CRITICAL, BatchStatus.EXPIRED)]


def _fmt(b: ProduceBatch) -> str:
    return f"{b.produce_name} ({b.batch_code})"


# ── intent handlers ───────────────────────────────────────────────────────────

def _intent_expiring(q: str, batches) -> str | None:
    if not ("expir" in q or "expire" in q or "going bad" in q or "use by" in q):
        return None
    days = 3 if "today" in q or "urgent" in q else 7 if "week" in q or "soon" in q else 14 if "fortnight" in q or "two week" in q else 7
    soon = _expiring_within(batches, days)
    if not soon:
        return f"No batches are predicted to expire within {days} days. Inventory looks stable."
    names = ", ".join(_fmt(b) for b in soon[:8])
    extra = f" (+{len(soon) - 8} more)" if len(soon) > 8 else ""
    return f"{len(soon)} batch(es) expiring within {days} days: {names}{extra}."


def _intent_wastage(q: str, batches) -> str | None:
    if not ("wastage" in q or "wasted" in q or "waste" in q or "loss" in q or "highest" in q):
        return None
    totals: Counter = Counter()
    for b in _critical(batches):
        totals[b.warehouse_location or "Unknown"] += b.quantity_kg
    if not totals:
        return "No significant wastage detected — no critical or expired batches right now."
    top, kg = totals.most_common(1)[0]
    all_wh = ", ".join(f"{wh}: {v:.0f}kg" for wh, v in totals.most_common(5))
    return f"Highest wastage is at {top} ({kg:.0f}kg critical/expired). All warehouses: {all_wh}."


def _intent_spoilage_risk(q: str, batches) -> str | None:
    if not ("spoilage" in q or "risk" in q or "probability" in q or "risky" in q):
        return None
    threshold = 0.7 if "high" in q or "critical" in q else 0.5
    risky = [b for b in batches if b.spoilage_probability and b.spoilage_probability >= threshold]
    if not risky:
        return f"No batches currently have spoilage probability ≥{threshold:.0%}."
    names = ", ".join(f"{_fmt(b)} {b.spoilage_probability:.0%}" for b in sorted(risky, key=lambda x: -x.spoilage_probability)[:8])
    return f"{len(risky)} batch(es) at ≥{threshold:.0%} spoilage risk: {names}."


def _intent_inventory_total(q: str, batches) -> str | None:
    if not ("total" in q or "inventory" in q or "stock" in q or "how much" in q or "how many" in q):
        return None
    total_kg = sum(b.quantity_kg for b in batches)
    by_status: Counter = Counter(b.status.value for b in batches)
    status_str = ", ".join(f"{k}: {v}" for k, v in by_status.most_common())
    return (
        f"Total inventory: {total_kg:.0f}kg across {len(batches)} batches. "
        f"Status breakdown — {status_str}."
    )


def _intent_temperature(q: str, batches) -> str | None:
    if not ("temp" in q or "cold" in q or "warm" in q or "hot" in q or "cool" in q):
        return None
    hot = [b for b in batches if b.temperature_c and b.temperature_c > 8]
    if not hot:
        return "All batches are within acceptable temperature ranges (≤8°C)."
    names = ", ".join(f"{_fmt(b)} at {b.temperature_c:.1f}°C" for b in sorted(hot, key=lambda x: -x.temperature_c)[:6])
    return f"{len(hot)} batch(es) above 8°C: {names}. Consider moving to cold storage."


def _intent_humidity(q: str, batches) -> str | None:
    if "humid" not in q and "moisture" not in q:
        return None
    high = [b for b in batches if b.humidity_pct and b.humidity_pct > 95]
    low = [b for b in batches if b.humidity_pct and b.humidity_pct < 80]
    parts = []
    if high:
        parts.append(f"{len(high)} batch(es) above 95% humidity (mold risk): " + ", ".join(_fmt(b) for b in high[:5]))
    if low:
        parts.append(f"{len(low)} batch(es) below 80% humidity (desiccation risk): " + ", ".join(_fmt(b) for b in low[:5]))
    if not parts:
        return "All batches are within the 80–95% humidity target range."
    return " | ".join(parts) + "."


def _intent_reduce_spoilage(q: str, batches) -> str | None:
    if not ("reduce" in q or "prevent" in q or "improve" in q or "how can" in q or "tip" in q or "advice" in q):
        return None
    return (
        "Top spoilage-reduction actions: "
        "(1) Keep temperature-sensitive produce at 2–4°C. "
        "(2) Maintain humidity 85–95% for most produce. "
        "(3) Use FIFO rotation — sell oldest batches first. "
        "(4) Prioritize batches with spoilage probability >60%. "
        "(5) Separate visibly damaged produce to prevent cross-contamination. "
        "(6) Reduce transport dwell time below 2 hours where possible."
    )


def _intent_warehouse_compare(q: str, batches) -> str | None:
    if not ("warehouse" in q or "location" in q or "site" in q or "hub" in q or "vault" in q):
        return None
    by_wh: dict = defaultdict(list)
    for b in batches:
        by_wh[b.warehouse_location or "Unknown"].append(b)
    if not by_wh:
        return "No warehouse data available."
    rows = []
    for wh, bs in sorted(by_wh.items()):
        avg_sp = sum(b.spoilage_probability or 0 for b in bs) / len(bs)
        rows.append(f"{wh}: {len(bs)} batches, avg spoilage {avg_sp:.0%}")
    return "Warehouse summary — " + " | ".join(rows) + "."


def _intent_produce_breakdown(q: str, batches) -> str | None:
    if not ("produce" in q or "category" in q or "type" in q or "fruit" in q or "vegetable" in q or "dairy" in q):
        return None
    by_produce: Counter = Counter(b.produce_name for b in batches)
    top = by_produce.most_common(8)
    return "Produce breakdown: " + ", ".join(f"{p}: {c}" for p, c in top) + "."


def _intent_critical_batches(q: str, batches) -> str | None:
    if not ("critical" in q or "urgent" in q or "emergency" in q or "immediate" in q or "expired" in q):
        return None
    crit = _critical(batches)
    if not crit:
        return "No critical or expired batches at this time."
    names = ", ".join(_fmt(b) for b in crit[:8])
    extra = f" (+{len(crit) - 8} more)" if len(crit) > 8 else ""
    return f"{len(crit)} critical/expired batch(es) require immediate attention: {names}{extra}."


def _intent_best_batch(q: str, batches) -> str | None:
    if not ("best" in q or "freshest" in q or "longest" in q or "most shelf" in q):
        return None
    good = [b for b in batches if b.predicted_expiry_date]
    if not good:
        return "No shelf-life predictions available yet."
    best = max(good, key=_days_left)
    return f"Freshest batch: {_fmt(best)} with {_days_left(best)} days remaining (expires {best.predicted_expiry_date})."


def _intent_model_accuracy(q: str, batches) -> str | None:
    if not ("model" in q or "accuracy" in q or "confidence" in q or "ai" in q or "machine learning" in q or "ml" in q):
        return None
    return (
        "The RipeCrate ensemble (GradientBoosting + XGBoost) achieves ~92% ROC-AUC on the "
        "spoilage classifier and R²≈0.88 on the shelf-life regressor, trained on 100k rows "
        "of perishable goods data. Confidence scores are derived from classifier entropy."
    )


def _intent_report(q: str, batches) -> str | None:
    if not ("report" in q or "pdf" in q or "csv" in q or "export" in q or "download" in q or "summary" in q):
        return None
    return (
        "You can generate reports from the Reports page. "
        "Use 'Generate PDF' for an executive spoilage summary or 'Download CSV' for raw batch data. "
        "The PDF endpoint is GET /api/reports/summary-pdf (requires auth token)."
    )


_INTENTS = [
    _intent_expiring,
    _intent_critical_batches,
    _intent_wastage,
    _intent_spoilage_risk,
    _intent_temperature,
    _intent_humidity,
    _intent_reduce_spoilage,
    _intent_warehouse_compare,
    _intent_produce_breakdown,
    _intent_inventory_total,
    _intent_best_batch,
    _intent_model_accuracy,
    _intent_report,
]


def answer_question(question: str, batches: list[ProduceBatch]) -> str:
    q = question.lower().strip()
    for intent_fn in _INTENTS:
        result = intent_fn(q, batches)
        if result:
            return result
    return (
        "I can help with: expiring produce, critical batches, warehouse wastage, spoilage risk, "
        "temperature/humidity issues, inventory totals, produce breakdown, warehouse comparison, "
        "model accuracy, reports, and spoilage-reduction tips. "
        "Try: \"Which batches expire this week?\", \"Which warehouse has the most wastage?\", "
        "\"How can I reduce spoilage?\", or \"Show me critical batches\"."
    )


@router.post("/ask")
def ask_assistant(
    payload: AssistantQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batches = db.query(ProduceBatch).all()
    answer = answer_question(payload.question, batches)
    return {"question": payload.question, "answer": answer}
