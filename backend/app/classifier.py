# backend/app/classifier.py
from typing import List, Dict

# category keywords (extend)
CATEGORIES = {
    "income": ["salary", "credited", "payroll", "salary credited", "salary"],
    "emi": ["emi", "loan", "instalment"],
    "shopping": ["flipkart", "amazon", "myntra", "bigbazaar", "zomato", "paytm", "swiggy", "booking"],
    "bills": ["electricity", "water bill", "bill", "recharge"],
    "transfer": ["transfer", "neft", "imps", "rtgs"],
    "upi": ["upi", "gpay", "phonepe", "paytm", "bhim"],
    "atm": ["atm", "withdraw"],
    "other": []
}

def classify_transactions(transactions: List[Dict]) -> List[Dict]:
    for t in transactions:
        msg = (t.get("message") or "").lower()
        t["category"] = "other"
        # exact category match by keyword
        for cat, keys in CATEGORIES.items():
            for k in keys:
                if k in msg:
                    t["category"] = cat
                    break
            if t["category"] != "other":
                break

        # refine using type
        if t["category"] == "other":
            if t.get("type") == "credit":
                t["category"] = "income"
            elif t.get("type") == "debit":
                t["category"] = "shopping"

        # ensure amount is numeric
        if t.get("amount") is None:
            t["amount"] = 0.0

    return transactions