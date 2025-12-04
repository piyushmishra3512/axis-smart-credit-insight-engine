def calculate_score(transactions):
    """
    transactions: list of dicts with at least:
      - amount (float)
      - category: "income" | "expense" | "emi" | ...
      - type: "credit" | "debit"
    Returns: score (0–100) and metrics dict
    """

    income = 0.0
    expense = 0.0
    emi = 0.0

    for t in transactions:
        amt = float(t.get("amount") or 0)
        cat = (t.get("category") or "").lower()
        typ = (t.get("type") or "").lower()

        # 1) Primary: use explicit category if present
        if cat in ("income", "salary", "inflow"):
            income += amt
        elif cat in ("emi", "loan_emi", "loan"):
            emi += amt
        elif cat == "expense":
            expense += amt
        else:
            # 2) Fallback: infer from type when category is unknown
            if typ == "credit":
                income += amt
            elif typ == "debit":
                expense += amt
            else:
                # nothing – unknown transaction
                pass

    # yahan se neeche same logic jo pehle diya tha:

    if income <= 0:
        score = 20
        savings = -expense - emi
        metrics = {
            "income": round(income, 2),
            "expense": round(expense, 2),
            "emi": round(emi, 2),
            "savings": round(savings, 2),
            "dti": None,
            "savings_rate": None,
        }
        return max(0, min(100, score)), metrics

    savings = income - expense - emi
    dti = emi / income
    savings_rate = max(0, savings) / income

    # ---------- Scoring logic (same as pehle) ----------
    score = 50

    if dti < 0.2:
        score += 15
    elif dti < 0.36:
        score += 10
    elif dti < 0.5:
        score += 0
    else:
        score -= 10

    if savings > 0:
        if savings_rate > 0.3:
            score += 15
        elif savings_rate > 0.15:
            score += 10
        elif savings_rate > 0.05:
            score += 5
        else:
            score += 0
    else:
        score -= 10

    expense_ratio = expense / income
    if expense_ratio < 0.5:
        score += 10
    elif expense_ratio < 0.7:
        score += 5
    else:
        score -= 5

    if emi > 0 and emi > 0.4 * income:
        score -= 5

    score = max(0, min(100, score))

    metrics = {
        "income": round(income, 2),
        "expense": round(expense, 2),
        "emi": round(emi, 2),
        "savings": round(savings, 2),
        "dti": round(dti, 3),
        "savings_rate": round(savings_rate, 3),
    }

    return score, metrics