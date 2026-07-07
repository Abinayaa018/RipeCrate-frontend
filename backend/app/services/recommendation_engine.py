"""
Generates actionable, explainable recommendations from a prediction result
and the input conditions. Each recommendation states WHY it's being made,
tying back to the specific metric that triggered it.
"""

IDEAL_HUMIDITY_RANGE = (85, 95)
IDEAL_TEMP_RANGE = (0, 8)


def generate_recommendations(payload: dict, prediction: dict) -> list[dict]:
    recs: list[dict] = []

    temp = payload["temperature_c"]
    humidity = payload["humidity_pct"]
    spoilage_prob = prediction["spoilage_probability"]
    shelf_life = prediction["predicted_shelf_life_days"]
    storage_type = payload["storage_type"]

    if temp > IDEAL_TEMP_RANGE[1]:
        recs.append({
            "title": "Reduce storage temperature",
            "reason": (
                f"Current temperature is {temp}°C, above the recommended "
                f"{IDEAL_TEMP_RANGE[1]}°C ceiling. Elevated temperature accelerates "
                "ripening and microbial growth, directly reducing shelf life."
            ),
            "priority": "high" if temp > IDEAL_TEMP_RANGE[1] + 5 else "medium",
        })

    if humidity < IDEAL_HUMIDITY_RANGE[0]:
        recs.append({
            "title": "Increase humidity",
            "reason": (
                f"Humidity is {humidity}%, below the ideal "
                f"{IDEAL_HUMIDITY_RANGE[0]}–{IDEAL_HUMIDITY_RANGE[1]}% band. Low humidity "
                "causes moisture loss, wilting, and weight shrinkage."
            ),
            "priority": "medium",
        })
    elif humidity > IDEAL_HUMIDITY_RANGE[1]:
        recs.append({
            "title": "Improve ventilation to lower humidity",
            "reason": (
                f"Humidity is {humidity}%, above the ideal "
                f"{IDEAL_HUMIDITY_RANGE[0]}–{IDEAL_HUMIDITY_RANGE[1]}% band. Excess humidity "
                "promotes mold and bacterial growth."
            ),
            "priority": "medium",
        })

    if storage_type not in ("Cold Storage", "Refrigerated", "Controlled Atmosphere") and spoilage_prob > 0.4:
        recs.append({
            "title": "Move batch to cold storage",
            "reason": (
                f"Spoilage probability is {spoilage_prob:.0%} under '{storage_type}' storage. "
                "Cold storage slows enzymatic and microbial activity, extending shelf life."
            ),
            "priority": "high",
        })

    if spoilage_prob >= 0.6 or shelf_life <= 3:
        recs.append({
            "title": "Prioritize selling this batch",
            "reason": (
                f"Predicted remaining shelf life is only {shelf_life} day(s) with a "
                f"{spoilage_prob:.0%} spoilage probability. Selling or redistributing now "
                "minimizes write-off losses."
            ),
            "priority": "high",
        })

    if 0.3 <= spoilage_prob < 0.6:
        recs.append({
            "title": "Rotate inventory (FIFO)",
            "reason": (
                f"This batch carries moderate spoilage risk ({spoilage_prob:.0%}). "
                "Rotating stock so older batches are sold first reduces overall wastage."
            ),
            "priority": "medium",
        })

    if spoilage_prob >= 0.5:
        recs.append({
            "title": "Inspect and separate damaged produce",
            "reason": (
                "High spoilage probability increases the chance that some units in this "
                "batch are already compromised. Isolating damaged produce prevents it from "
                "accelerating spoilage in the rest of the batch."
            ),
            "priority": "medium",
        })

    if not recs:
        recs.append({
            "title": "No action needed",
            "reason": (
                f"Storage conditions are within ideal ranges and spoilage probability is low "
                f"({spoilage_prob:.0%}). Continue routine monitoring."
            ),
            "priority": "low",
        })

    return recs
