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

class PredictSavingsRequest(BaseModel):
    transactions: List[Transaction]
    monthlySalary: float
    targetSavingsAmount: float

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
    
    # 1. Anomaly Detection
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

@app.post("/api/ml/predict-savings")
def predict_savings(req: PredictSavingsRequest):
    if not req.transactions:
        return {
            "projected_spend": 0,
            "status": "on_track",
            "advice": "No recent spending detected. You're well on your way to your savings goal!"
        }

    # Handle both Pydantic v1 and v2
    data = []
    for t in req.transactions:
        if hasattr(t, "model_dump"):
            data.append(t.model_dump())
        else:
            data.append(t.dict())
            
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'])
    
    # Get last 7 days of spending
    now = pd.Timestamp.now()
    seven_days_ago = now - pd.Timedelta(days=7)
    recent_df = df[df['date'] >= seven_days_ago]
    
    # Calculate 7-day run-rate
    seven_day_spend = recent_df['amount'].sum()
    daily_run_rate = seven_day_spend / 7
    
    # Project end-of-month spending
    # days_in_month can vary by pandas version, using a safer approach
    days_in_month = pd.Period(now.strftime('%Y-%m')).days_in_month
    days_left = max(1, days_in_month - now.day) # Ensure at least 1 day to avoid div by zero
    
    current_month_total = df[df['date'].dt.month == now.month]['amount'].sum()
    projected_eom_spend = current_month_total + (daily_run_rate * days_left)
    
    # Compare with allowable spend
    allowable_spend = req.monthlySalary - req.targetSavingsAmount
    variance = projected_eom_spend - allowable_spend
    
    # Identify highest spend category in recent days
    if not recent_df.empty:
        cat_group = recent_df.groupby('category')['amount'].sum()
        top_cat = cat_group.idxmax()
        weekly_cut = (variance / days_left) * 7 if variance > 0 else 0
    else:
        top_cat = "General"
        weekly_cut = 0

    if variance > 0:
        advice = f"You are projected to miss your target by ${variance:.2f}. Try cutting your highest spend category, '{top_cat}', by ${weekly_cut:.2f} per week to stay on track."
        status = "at_risk"
    else:
        savings_over = abs(variance)
        advice = f"Great job! You are currently projected to exceed your savings target by ${savings_over:.2f}. Keep up the disciplined spending!"
        status = "on_track"

    return {
        "projected_spend": round(float(projected_eom_spend), 2),
        "variance": round(float(variance), 2),
        "status": status,
        "advice": advice
    }
