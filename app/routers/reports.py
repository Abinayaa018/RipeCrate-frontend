import io
from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.batch import ProduceBatch, BatchStatus
from app.models.user import User
from app.routers.analytics import analytics_overview
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/summary-pdf")
def generate_summary_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    batches = db.query(ProduceBatch).all()
    analytics = analytics_overview(db=db, current_user=current_user)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("RipeCrate — Inventory & Spoilage Report", styles["Title"]))
    elements.append(Paragraph(f"Generated on {date.today().isoformat()}", styles["Normal"]))
    elements.append(Spacer(1, 0.5 * cm))

    # Inventory summary
    elements.append(Paragraph("Inventory Summary", styles["Heading2"]))
    total_weight = sum(b.quantity_kg for b in batches)
    status_counts = {s.value: 0 for s in BatchStatus}
    for b in batches:
        status_counts[b.status.value] += 1

    summary_table_data = [["Metric", "Value"]]
    summary_table_data.append(["Total Batches", str(len(batches))])
    summary_table_data.append(["Total Weight (kg)", f"{total_weight:.1f}"])
    for status_name, count in status_counts.items():
        summary_table_data.append([f"Status: {status_name}", str(count)])

    elements.append(_styled_table(summary_table_data))
    elements.append(Spacer(1, 0.5 * cm))

    # Spoilage summary
    elements.append(Paragraph("Spoilage Summary", styles["Heading2"]))
    spoilage_table = [["Produce", "Wasted (kg)"]]
    for item in analytics["most_wasted_produce"]:
        spoilage_table.append([item["produce"], f"{item['wasted_kg']:.1f}"])
    if len(spoilage_table) == 1:
        spoilage_table.append(["No significant spoilage detected", "-"])
    elements.append(_styled_table(spoilage_table))
    elements.append(Spacer(1, 0.5 * cm))

    # Savings
    elements.append(Paragraph("Estimated Savings", styles["Heading2"]))
    savings_table = [
        ["Metric", "Value"],
        ["Financial Loss Prevented (USD)", f"${analytics['financial_loss_prevented_usd']:.2f}"],
        ["Carbon Emissions Saved (kg CO2e)", f"{analytics['carbon_emission_savings_kg']:.1f}"],
    ]
    elements.append(_styled_table(savings_table))
    elements.append(Spacer(1, 0.5 * cm))

    # Warehouse comparison
    elements.append(Paragraph("Warehouse Comparison", styles["Heading2"]))
    warehouse_table = [["Warehouse", "Total Weight (kg)", "Avg Spoilage Prob.", "Batches"]]
    for w in analytics["warehouse_comparison"]:
        warehouse_table.append([
            w["warehouse"], f"{w['total_weight_kg']:.1f}",
            f"{w['avg_spoilage_probability']:.0%}", str(w["batch_count"]),
        ])
    elements.append(_styled_table(warehouse_table))

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ripecrate_report.pdf"},
    )


def _styled_table(data: list[list[str]]) -> Table:
    table = Table(data, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    return table
