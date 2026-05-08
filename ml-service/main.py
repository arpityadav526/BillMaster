from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np

app = FastAPI(title="BillMaster ML Service")

class Transaction(BaseModel):
    amount: float
    category: str
    date: str

class InsightsRequest(BaseModel):
    transactions: List[Transaction]
    user_id: str

@app.get("/")
def read_root():
    return {"status": "ML Service is running"}

@app.post("/api/ml/analyze")
def analyze_spending(req: InsightsRequest):
    if not req.transactions:
        return {"insights": []}
    
    df = pd.DataFrame([t.dict() for t in req.transactions])
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'])
    
    insights = []
    
    # 1. Anomaly Detection (simple statistical model: amount > mean + 2*std)
    mean_val = df['amount'].mean()
    std_val = df['amount'].std()
    if pd.notna(std_val) and std_val > 0:
        anomalies = df[df['amount'] > (mean_val + 2 * std_val)]
        if not anomalies.empty:
            max_anomaly = anomalies.iloc[0]
            insights.append({
                "type": "warning",
                "title": "Unusual Expense Detected",
                "description": f"An unusually large expense of ${max_anomaly['amount']:.2f} was detected in {max_anomaly['category']}.",
                "severity": "high"
            })
            
    # 2. Category Concentration
    cat_sum = df.groupby('category')['amount'].sum().sort_values(ascending=False)
    if not cat_sum.empty:
        top_cat = cat_sum.index[0]
        top_pct = (cat_sum.iloc[0] / cat_sum.sum()) * 100
        if top_pct > 40:
            insights.append({
                "type": "info",
                "title": "High Category Concentration",
                "description": f"{top_pct:.1f}% of your spending is going towards {top_cat}. Consider setting a stricter budget.",
                "severity": "medium"
            })

    return {"insights": insights}
