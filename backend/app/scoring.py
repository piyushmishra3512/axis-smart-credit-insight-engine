from typing import List, Dict


def calculate_score(transactions: List[Dict]):
    """
    transactions: list of dicts with fields:
      - amount (float)
      - type: 'credit' | 'debit' | 'unknown'
      - category: optional (income, expense, emi, investment, etc.)

    Returns:
      - score: 0–100
      - metrics: dict for UI
    """

    income = 0.0
    expense = 0.0
    emi = 0.0
    investment = 0.0

    for t in transactions:
        amt = float(t.get("amount") or 0)
        if amt <= 0:
            continue

        cat = (t.get("category") or "").lower()
        typ = (t.get("type") or "").lower()

        # --- Primary: use category if available ---
        if cat in ("income", "salary", "stipend", "inflow"):
            income += amt
        elif cat in ("emi", "loan_emi", "loan", "credit_card_emi", "home_loan"):
            emi += amt
        elif cat in ("investment", "sip", "mutual_fund"):
            investment += amt
        elif cat == "expense":
            expense += amt
        else:
            # --- Fallback: infer from type ---
            if typ == "credit":
                income += amt
            elif typ == "debit":
                expense += amt

    # Investments are also outgoing cash for this month
    total_outgo = expense + emi + investment
    savings = income - total_outgo

    # Guard: no income → can't compute ratios properly
    if income <= 0:
        score = 20
        metrics = {
            "income": round(income, 2),
            "expense": round(expense, 2),
            "emi": round(emi, 2),
            "investment": round(investment, 2),
            "savings": round(savings, 2),
            "dti": None,
            "savings_rate": None,
            "outgo_ratio": None,
        }
        return max(0, min(100, int(score))), metrics

    dti = emi / income               # Debt-to-income
    savings_rate = max(0.0, savings) / income
    outgo_ratio = total_outgo / income

    # ---------- Scoring ----------
    score = 50  # base

    # 1) DTI (lower is better)
    if dti == 0:
        score += 20
    elif dti < 0.20:
        score += 15
    elif dti < 0.36:
        score += 10
    elif dti < 0.50:
        score += 0
    else:
        score -= 10

    # 2) Savings rate
    if savings_rate >= 0.50:
        score += 20
    elif savings_rate >= 0.30:
        score += 15
    elif savings_rate >= 0.15:
        score += 8
    elif savings_rate >= 0.05:
        score += 0
    else:
        score -= 10

    # 3) Overall outgo ratio (expense + emi + investments)
    if outgo_ratio <= 0.50:
        score += 10
    elif outgo_ratio <= 0.70:
        score += 5
    else:
        score -= 5

    # 4) Special case: only credits / no debits
    has_debit = any((t.get("type") or "").lower() == "debit" for t in transactions)
    if not has_debit:
        # Pure inflow data (like PhonePe credit statement)
        # Ensure at least a high score if inflows exist
        score = max(score, 90)

    score = int(max(0, min(100, round(score))))

    metrics = {
        "income": round(income, 2),
        "expense": round(expense, 2),
        "emi": round(emi, 2),
        "investment": round(investment, 2),
        "savings": round(savings, 2),
        "dti": round(dti, 3),
        "savings_rate": round(savings_rate, 3),
        "outgo_ratio": round(outgo_ratio, 3),
    }

    return score, metrics
