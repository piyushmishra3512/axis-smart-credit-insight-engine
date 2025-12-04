# backend/app/recommendations.py
import math
from typing import Dict, Any


def _emi_to_loan(emi: float, annual_rate: float, years: int) -> float:
    """
    Convert EMI to loan amount using standard amortization formula.
    emi: monthly EMI
    annual_rate: e.g. 0.10 for 10%
    years: tenure in years
    """
    if emi <= 0:
        return 0.0
    r = annual_rate / 12.0
    n = years * 12
    if r == 0:
        return emi * n
    loan = emi * (1 - (1 + r) ** -n) / r
    return loan


def recommend_loan(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Basic loan affordability recommendation based on income, EMI and DTI.
    Expects metrics with keys: income, emi, savings, dti
    """
    income = metrics.get("income") or 0.0
    existing_emi = metrics.get("emi") or 0.0
    savings = metrics.get("savings") or 0.0
    dti = metrics.get("dti")

    if income <= 0 or dti is None:
        return {
            "can_take_loan": False,
            "reason": "No stable income detected from transactions.",
            "suggested_new_emi": 0.0,
            "approx_loan_amounts": [],
        }

    # Simple rules
    safe_ratio = 0.4  # total EMI should be <= 40% of income
    safe_total_emi = income * safe_ratio
    available_new_emi = safe_total_emi - existing_emi

    # Hard safety conditions
    if dti > 0.5:
        return {
            "can_take_loan": False,
            "reason": "Your current EMI burden is already high (DTI > 50%). Focus on reducing debt first.",
            "suggested_new_emi": 0.0,
            "approx_loan_amounts": [],
        }

    if savings <= 0:
        return {
            "can_take_loan": False,
            "reason": "Your savings are negative or zero. Build some buffer before taking a new loan.",
            "suggested_new_emi": 0.0,
            "approx_loan_amounts": [],
        }

    if available_new_emi <= 0:
        return {
            "can_take_loan": False,
            "reason": "Your EMI + expenses are already using most of your income.",
            "suggested_new_emi": 0.0,
            "approx_loan_amounts": [],
        }

    # Round EMI to nearest 500
    suggested_new_emi = max(0, round(available_new_emi / 500) * 500)

    # Approximate loan amount for a few common tenures
    tenures = [3, 5, 10]  # in years
    rate = 0.10  # 10% annual, can be tweaked
    loan_options = []
    for y in tenures:
        loan_amt = _emi_to_loan(suggested_new_emi, rate, y)
        loan_options.append(
            {
                "tenure_years": y,
                "approx_loan_amount": round(loan_amt, 2),
            }
        )

    return {
        "can_take_loan": True,
        "reason": (
            "Based on your current EMIs and income, you can safely take a new loan "
            "with the suggested EMI and tenures shown."
        ),
        "suggested_new_emi": round(suggested_new_emi, 2),
        "approx_loan_amounts": loan_options,
    }


def recommend_sip(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Basic SIP recommendation based on savings and savings_rate.
    Expects metrics with keys: income, savings, savings_rate
    """
    income = metrics.get("income") or 0.0
    savings = metrics.get("savings") or 0.0
    savings_rate = metrics.get("savings_rate")

    if income <= 0 or savings_rate is None:
        return {
            "should_invest": False,
            "reason": "Unable to detect stable income and savings from your data.",
            "suggested_sip": 0.0,
            "risk_profile": None,
        }

    # If savings are negative, no SIP
    if savings <= 0:
        return {
            "should_invest": False,
            "reason": "Your net savings are negative. Focus on reducing expenses or EMIs before starting a SIP.",
            "suggested_sip": 0.0,
            "risk_profile": None,
        }

    # If savings_rate is very small, start tiny SIP
    if savings_rate < 0.05:
        suggested = 500.0  # small starter SIP
        return {
            "should_invest": True,
            "reason": "Your savings are low. Start with a small SIP to build the habit while improving savings.",
            "suggested_sip": suggested,
            "risk_profile": "conservative",
        }

    # Reasonable savings: suggest 10–20% of income, capped by savings
    raw_sip = min(savings * 0.5, income * 0.2)
    # clamp between 1000 and something reasonable
    suggested = max(1000.0, min(raw_sip, income * 0.3))

    # Determine simple risk profile
    if savings_rate > 0.3:
        risk = "aggressive"
    elif savings_rate > 0.15:
        risk = "balanced"
    else:
        risk = "conservative"

    return {
        "should_invest": True,
        "reason": (
            "You have positive savings. A portion of this can be allocated to disciplined SIP investments."
        ),
        "suggested_sip": round(suggested, 2),
        "risk_profile": risk,
    }


def generate_tips(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate 3–5 simple textual tips based on metrics.
    """
    tips = []

    income = metrics.get("income") or 0.0
    expense = metrics.get("expense") or 0.0
    emi = metrics.get("emi") or 0.0
    savings = metrics.get("savings") or 0.0
    dti = metrics.get("dti")
    savings_rate = metrics.get("savings_rate")

    # Tip 1: EMI burden
    if dti is not None:
        if dti > 0.5:
            tips.append("Your EMI burden is very high (>50% of income). Avoid new loans and try to prepay high-interest debt.")
        elif dti > 0.36:
            tips.append("Your EMIs are on the higher side. Be careful before taking new loans.")
        else:
            tips.append("Your EMI to income ratio looks healthy. Try to maintain this level when taking new credit.")

    # Tip 2: Savings
    if savings <= 0:
        tips.append("You are not generating positive savings. Review discretionary expenses for possible cuts.")
    else:
        if savings_rate is not None and savings_rate < 0.1:
            tips.append("Your savings rate is low. Aim to save at least 10–15% of your income.")
        elif savings_rate is not None and savings_rate < 0.2:
            tips.append("Your savings rate is decent. Target 20% for stronger financial stability.")
        else:
            tips.append("Your savings rate looks good. Continue this habit and channel it into SIPs / long-term investments.")

    # Tip 3: Expense ratio
    if income > 0:
        expense_ratio = expense / income
        if expense_ratio > 0.7:
            tips.append("More than 70% of your income is going into expenses. Try to optimise lifestyle & fixed costs.")
        elif expense_ratio > 0.5:
            tips.append("Expenses are slightly high. Track your monthly spends and cut down non-essential items.")
        else:
            tips.append("Your expenses are within a healthy range relative to income.")

    # Tip 4: Emergency fund
    if expense > 0:
        emergency_months = savings / expense
        if emergency_months < 1:
            tips.append("You have less than 1 month of expenses as buffer. Build an emergency fund first.")
        elif emergency_months < 3:
            tips.append("Try to build at least 3 months of expenses as an emergency fund before aggressive investing.")
        else:
            tips.append("Your emergency buffer looks reasonable. You can focus more on long-term investments.")

    return {
        "tips": tips,
    }


def build_advice(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Combine loan recommendation, SIP suggestion, and tips into a single advice object.
    """
    loan = recommend_loan(metrics)
    sip = recommend_sip(metrics)
    tips = generate_tips(metrics)
    return {
        "loan": loan,
        "sip": sip,
        **tips,
    }