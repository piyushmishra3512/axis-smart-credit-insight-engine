# backend/app/parser.py
import re
from dateutil import parser as dateparser
from typing import List, Dict

# ---- Amount & Date Patterns ----
AMOUNT_RE = re.compile(r"(?:Rs\.?|INR|₹)\s?([0-9\.,]+)", re.IGNORECASE)
DATE_RES = [
    # dd/mm/yyyy or dd-mm-yyyy
    re.compile(r"\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b"),
    # 01-Nov-2025 or 1 Nov 2025 or Nov 01, 2025
    re.compile(
        r"\b(?:\d{1,2}[-\s])?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-\s]?\d{1,2}[-,]?\s?\d{2,4}\b",
        re.IGNORECASE,
    ),
]

# ---- Keywords ----
DEBIT_KEYWORDS = [
    "debited",
    "debit",          # important for 'Debit Rs.245.70'
    "deducted",
    "spent",
    "paid",
    "withdrawn",
    "sent",
]
CREDIT_KEYWORDS = [
    "credited",
    "received",
    "received a payment of",  # IPPB style
    "deposit",
    "deposit of",
    "inward",
    "salary",
    "refund",
]

# ---- Chunk-level message patterns for glued SMS blobs ----
# Match one "You have received a payment..." block up to the next credit/debit or end
CREDIT_MSG_RE = re.compile(
    r"(You have received a payment of Rs\.?.*?(?=You have received a payment of Rs\.?|Debit\s+Rs\.|$))",
    re.IGNORECASE | re.DOTALL,
)

# Match one "Debit Rs..." block up to the next credit/debit or end
DEBIT_MSG_RE = re.compile(
    r"(Debit\s+Rs\.?.*?(?=You have received a payment of Rs\.?|Debit\s+Rs\.|$))",
    re.IGNORECASE | re.DOTALL,
)


def _parse_amount(sms: str):
    m = AMOUNT_RE.search(sms)
    if not m:
        return None
    amt_str = m.group(1)
    amt_str = amt_str.replace(",", "").replace(" ", "")
    try:
        return float(amt_str)
    except:
        return None


def _parse_date(sms: str):
    # try regex first
    for r in DATE_RES:
        m = r.search(sms)
        if m:
            try:
                return dateparser.parse(m.group(0), dayfirst=True).date().isoformat()
            except:
                pass
    # fallback: try any date words
    try:
        dt = dateparser.parse(sms, fuzzy=True, dayfirst=True)
        if dt:
            return dt.date().isoformat()
    except:
        return None
    return None


def _line_based_parse(raw_text: str) -> List[Dict]:
    """
    Original line-based parser as a fallback for normal SMS formats.
    """
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    parsed: List[Dict] = []

    for line in lines:
        amt = _parse_amount(line)
        date = _parse_date(line)
        low = line.lower()

        # determine type more carefully
        typ = "unknown"
        if any(k in low for k in DEBIT_KEYWORDS) and not any(k in low for k in CREDIT_KEYWORDS):
            typ = "debit"
        elif any(k in low for k in CREDIT_KEYWORDS) and not any(k in low for k in DEBIT_KEYWORDS):
            typ = "credit"
        else:
            # if amount present and words like 'paid' prefer debit
            if "paid" in low or " to " in low:
                typ = "debit"
            elif "salary" in low or "credited" in low or "received" in low:
                typ = "credit"

        # try extract sender (bank / app)
        sender = None
        bank_match = re.match(r"^([A-Z0-9\-]{2,20})[:\-]\s*", line)
        if bank_match:
            sender = bank_match.group(1)

        parsed.append(
            {
                "message": line,
                "amount": amt,
                "type": typ,
                "date": date,
                "sender": sender,
            }
        )
    return parsed


def parse_sms(raw_text: str) -> List[Dict]:
    """
    Hybrid parser:
    1) First try to extract glued IPPB-style credit/debit messages from a long blob.
    2) If any such structured messages are found, return them.
    3) Otherwise, fall back to the original line-based parsing.
    """
    if not raw_text or not raw_text.strip():
        return []

    # Normalize whitespace (remove newlines, multiple spaces)
    normalized = " ".join(raw_text.split())

    transactions: List[Dict] = []

    # --- 1) Extract all credit messages in glued blob ---
    for m in CREDIT_MSG_RE.finditer(normalized):
        msg = m.group(1).strip()
        amt = _parse_amount(msg)
        date = _parse_date(msg)
        transactions.append(
            {
                "message": msg,
                "amount": amt,
                "type": "credit",
                "date": date,
                "sender": "IPPB",  # heuristic, you can refine
            }
        )

    # --- 2) Extract all debit messages in glued blob ---
    for m in DEBIT_MSG_RE.finditer(normalized):
        msg = m.group(1).strip()
        amt = _parse_amount(msg)
        date = _parse_date(msg)
        transactions.append(
            {
                "message": msg,
                "amount": amt,
                "type": "debit",
                "date": date,
                "sender": "IPPB",
            }
        )

    # If we successfully extracted multiple structured transactions, return them
    if transactions:
        return transactions

    # --- 3) Fallback: normal line-based SMS parsing ---
    return _line_based_parse(raw_text)