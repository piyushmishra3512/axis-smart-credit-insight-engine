from fastapi import FastAPI
from pydantic import BaseModel
from .parser import parse_sms
from .classifier import classify_transactions
from .scoring import calculate_score
from fastapi.middleware.cors import CORSMiddleware
from .recommendations import build_advice
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SMSInput(BaseModel):
    text: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/parse")
def parse_endpoint(data: SMSInput):
    transactions = parse_sms(data.text)
    return {"transactions": transactions}

@app.post("/score")
def score_endpoint(data: SMSInput):
    transactions = parse_sms(data.text)
    classified = classify_transactions(transactions)
    score, metrics = calculate_score(classified)
    advice = build_advice(metrics) 
    

    return {
        "score": score,
        "metrics": metrics,
        "transactions": classified,
        "advice": advice,   
    }