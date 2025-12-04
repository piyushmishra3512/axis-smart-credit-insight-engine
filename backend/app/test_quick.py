# backend/app/test_quick.py
from parser import parse_sms
from classifier import classify_transactions
from scoring import calculate_score

SAMPLE = """
SBIN: Rs.500.00 debited on 21/11/2025 at ATM. Your balance is Rs.1500.00
HDFC: Your account credited with INR 12000 on 01-Nov-2025. Salary received.
UPI: Rs.200 paid to Flipkart on 02-Nov-2025
AXIS: Rs.150.00 debited for electricity bill on 05-Nov-2025
Your EMI of Rs.3000 is debited on 10-Nov-2025
ICICI: INR 25000 credited on 01-Dec-2025. Salary credited.
PayTM: Rs.1200 sent to Big Bazaar on 04-Dec-2025
"""

tx = parse_sms(SAMPLE)
print("PARSED:", tx)
classified = classify_transactions(tx)
print("CLASSIFIED:", classified)
score, metrics = calculate_score(classified)
print("SCORE:", score)
print("METRICS:", metrics)
