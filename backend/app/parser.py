# backend/app/parser.py
import re
from dateutil import parser as dateparser
from typing import List, Dict
STATEMENT_DATE_SPLIT_RE = re.compile(r"(\d{2}/\d{2}/\d{2})")

PHONEPE_BLOCK_RE = re.compile(
    r"((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2},\s+20\d{2}.*?₹[0-9,]+)",
    re.IGNORECASE | re.DOTALL,
)


AMOUNT_RE = re.compile(r"(?:Rs\.?|INR|₹)\s?([0-9\.,]+)", re.IGNORECASE)
DATE_DD_MON_RE = re.compile(
    r"\b\d{2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20\d{2}\b",
    re.IGNORECASE,
)
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
    "debit",          
    "deducted",
    "spent",
    "paid",
    "withdrawn",
    "sent",
]
CREDIT_KEYWORDS = [
    "credited",
    "received",
    "received a payment of",  
    "deposit",
    "deposit of",
    "inward",
    "salary",
    "refund",
]


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

def parse_statement_dd_mon(raw_text: str) -> List[Dict]:
    """
    Parse SBI-type statement blocks like:

    02 DEC 2025
    TRANSFER TO ...
    UPI/DR/....
    70.00
    200.00
    4817.24

    We only care about:
      - date
      - description (full text of block)
      - transaction amount (first number)
      - type: credit/debit (from DR/CR / FROM/TO)
    """

    if not raw_text or not raw_text.strip():
        return []

    
    text = " ".join(raw_text.split())

    # agar 2 se kam DD MON YYYY dates hai, to ye format nahi hai
    matches = list(DATE_DD_MON_RE.finditer(text))
    if len(matches) < 2:
        return []

    blocks: List[str] = []

    # Split text into blocks per date range
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[start:end].strip()
        blocks.append(block)

    transactions: List[Dict] = []

    for block in blocks:
        # date string
        dm = DATE_DD_MON_RE.search(block)
        if not dm:
            continue
        date_str = dm.group(0)
        date_iso = _parse_date(date_str)

        # block without date
        body = block[len(date_str):].strip()
        low = body.lower()

        # ignore headers like "date credit balance details..."
        if "date credit balance" in low:
            continue

        # Find all "number.number" style amounts in body
        nums = re.findall(r"([0-9]+\.[0-9]{2})", body)
        if not nums:
            continue

        # Heuristic:
        # - last number is often balance
        # - first/second number is usually txn amount
        # For simplicity: pick the first number as txn amount
        try:
            amount = float(nums[0])
        except:
            continue

        # Determine type from DR / CR or "transfer from/to"
        typ = "debit"
        if "upi/cr" in low or " transfer from " in f" {low} " or "/cr/" in low:
            typ = "credit"
        elif "upi/dr" in low or " transfer to " in f" {low} " or "/dr/" in low:
            typ = "debit"

        transactions.append(
            {
                "message": body,      # full description; classifier baad me category nikaal lega
                "amount": amount,
                "type": typ,
                "date": date_iso,
                "sender": None,
            }
        )

    return transactions

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
def parse_phonepe_statement(raw_text: str) -> List[Dict]:
    """
    Parse PhonePe style statement text like:

    Dec 03, 2025
    12:51 pm
    Received from ...
    ...
    CREDIT
    ₹2,800
    """

    if not raw_text or "phonepe.com/statement" not in raw_text.lower():
        return []

    txns: List[Dict] = []

    for match in PHONEPE_BLOCK_RE.finditer(raw_text):
        block = match.group(1)  # full block from date till amount
        date = _parse_date(block)
        amt = _parse_amount(block)
        if not amt:
            continue

        low = block.lower()
        typ = "credit"
        if "debit" in low:
            typ = "debit"

        txns.append(
            {
                "message": " ".join(block.split()),  # single-line description
                "amount": amt,
                "type": typ,
                "date": date,
                "sender": "PhonePe",
            }
        )

    return txns

def parse_phonepe_block(raw_text: str) -> List[Dict]:
    """
    Parses PhonePe exported statement blocks:
    Date
    Time
    Paid to / Received from
    Transaction ID
    UTR
    Type
    Amount
    """
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    txns = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Detect block start: date format like "Dec 03, 2025"
        if re.match(r"^[A-Za-z]{3} \d{2}, \d{4}$", line):
            date = line
            time = None
            desc = None
            typ = None
            amt = None

            # next few lines are the transaction details
            j = i + 1
            while j < len(lines) and not re.match(r"^[A-Za-z]{3} \d{2}, \d{4}$", lines[j]):
                l = lines[j]

                # time
                if re.match(r"^\d{2}:\d{2} \w{2}$", l):
                    time = l

                # Paid to / Received from
                if l.startswith("Paid to"):
                    desc = l.replace("Paid to ", "")
                if l.startswith("Received from"):
                    desc = l.replace("Received from ", "")

                # Type line
                if l.upper() in ["DEBIT", "CREDIT"]:
                    typ = l.lower()

                # Amount line: ₹123
                if re.search(r"[₹Rr][\s.]?(\d+)", l):
                    amt = _parse_amount(l)

                j += 1

            # Build final date
            final_date = None
            try:
                final_date = str(dateparser.parse(date).date())
            except:
                pass

            if amt:
                txns.append({
                    "message": desc or "transaction",
                    "amount": amt,
                    "type": typ or "unknown",
                    "date": final_date,
                    "sender": "PhonePe"
                })

            i = j
        else:
            i += 1

    return txns

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

def parse_bank_statement(raw_text: str) -> List[Dict]:
    """
    Parse bank mini-statement style text like:

    01/10/25Opening Balance---45,500.00
    02/10/25ATM WDL ...5,000.00-40,500.00
    ...

    Returns list of {message, amount, type, category, date}
    """

    if not raw_text:
        return []

    text = raw_text

    # Summary ke baad ka sab ignore karo
    cut_markers = ["📊 Summary of Transactions", "Summary of Transactions"]
    for m in cut_markers:
        idx = text.find(m)
        if idx != -1:
            text = text[:idx]
            break

    if "Opening Balance" not in text or "Closing Balance" not in text:
        return []

    # Normalize whitespace
    text = " ".join(text.split())

    # Date pattern pe split karo: 01/10/25, 02/10/25, ...
    parts = STATEMENT_DATE_SPLIT_RE.split(text)
    # parts = ["", "01/10/25", "Opening Balance---45,500.00", "02/10/25", "ATM WDL ...", ...]

    rows: List[str] = []
    for i in range(1, len(parts), 2):
        date_str = parts[i]
        rest = parts[i + 1] if i + 1 < len(parts) else ""
        rows.append(f"{date_str} {rest}".strip())

    transactions: List[Dict] = []

    for row in rows:
        low = row.lower()

        # Opening / Closing balance skip kar do
        if "opening balance" in low or "closing balance" in low:
            continue

        # Date parse
        date = _parse_date(row)

        # Amounts nikaalo: aam tor par 2 honge: txn amount + balance
        amounts = AMOUNT_RE.findall(row)
        if not amounts:
            continue

        # First amount ko transaction amount maan lo
        amt_str = amounts[0].replace(",", "").replace(" ", "")
        try:
            amount = float(amt_str)
        except:
            continue

        # Description: date ke baad jo bacha
        desc = row[8:].strip()

        # Type detect (credit/debit)
        typ = "debit"
        if " cr " in f" {desc.lower()} " or "cash dep" in low or "interest" in low:
            typ = "credit"

        # Category detect (simple heuristics)
        cat = "expense"
        d = desc.lower()

        if any(k in d for k in ["salary", "stipend", "interest"]):
            cat = "income"
        elif any(k in d for k in ["home loan", "car emi", "emi"]):
            cat = "emi"
        elif any(k in d for k in ["sip", "mutual fund", "investment"]):
            cat = "investment"
        elif any(k in d for k in ["grocery", "dmart"]):
            cat = "expense"
        elif any(k in d for k in ["swiggy", "zomato", "restaurant", "dining"]):
            cat = "expense"
        elif any(k in d for k in ["amazon", "shopping", "flipkart"]):
            cat = "expense"
        elif any(k in d for k in ["petrol", "fuel", "hpcl", "bpcl"]):
            cat = "expense"
        elif any(k in d for k in ["electricity", "billpay", "bill"]):
            cat = "expense"
        elif any(k in d for k in ["maid", "domestic help"]):
            cat = "expense"
        elif any(k in d for k in ["credit card bill", "card pmt"]):
            cat = "emi"  # treat as EMI-like fixed outgoing

        transactions.append(
            {
                "message": desc,
                "amount": amount,
                "type": typ,      
                "category": cat,  
                "date": date,
                "sender": None,
            }
        )

    return transactions


def parse_sms(raw_text: str) -> List[Dict]:
    """
    FINAL UNIVERSAL PARSER ORDER:
    1) PhonePe block-style statements
    2) SBI-style DD MON YYYY statements
    3) Mini-statements (dd/mm/yy)
    4) Glued SMS/UPI messages
    5) Line fallback
    """

    if not raw_text or not raw_text.strip():
        return []

    text = raw_text.strip()

    # 1) PhonePe block parser
    phonepe_txns = parse_phonepe_block(text)
    if phonepe_txns:
        return phonepe_txns

    # 2) SBI-type DD MON YYYY statement parser
    stmt1 = parse_statement_dd_mon(text)
    if stmt1:
        return stmt1

    # 3) Mini bank statement dd/mm/yy
    stmt2 = parse_bank_statement(text)
    if stmt2:
        return stmt2

    # === 4) Glued SMS parser ===
    normalized = " ".join(text.split())
    glued_txns = []

    for m in CREDIT_MSG_RE.finditer(normalized):
        msg = m.group(1).strip()
        glued_txns.append({
            "message": msg,
            "amount": _parse_amount(msg),
            "type": "credit",
            "date": _parse_date(msg),
            "sender": "SMS"
        })

    for m in DEBIT_MSG_RE.finditer(normalized):
        msg = m.group(1).strip()
        glued_txns.append({
            "message": msg,
            "amount": _parse_amount(msg),
            "type": "debit",
            "date": _parse_date(msg),
            "sender": "SMS"
        })

    if glued_txns:
        return glued_txns

    # 5) Final fallback
    return _line_based_parse(text)

