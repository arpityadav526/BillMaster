from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re

app = FastAPI(title="BillMaster ML Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ───────────────────────────────────────────────────────────

class Transaction(BaseModel):
    amount: float
    category: str
    date: str
    description: Optional[str] = ""

    def to_dict(self) -> dict:
        """Pydantic v1/v2 compatible serialization."""
        try:
            return self.model_dump()
        except AttributeError:
            return self.dict()

class InsightsRequest(BaseModel):
    transactions: List[Transaction]
    user_id: str

class PredictSavingsRequest(BaseModel):
    transactions: List[Transaction]
    monthlySalary: float
    targetSavingsAmount: float

class ChatRequest(BaseModel):
    question: str
    transactions: List[Transaction]
    monthlySalary: Optional[float] = 0
    targetSavingsAmount: Optional[float] = 0
    user_id: str

# ─── Helpers ──────────────────────────────────────────────────────────────────

def build_df(transactions: List[Transaction]) -> pd.DataFrame:
    """Convert transaction list to a clean DataFrame."""
    data = [t.to_dict() for t in transactions]
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'], errors='coerce', utc=True)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['description'] = df.get('description', pd.Series([''] * len(df))).fillna('')
    df = df.dropna(subset=['date'])
    return df

def fmt(amount: float) -> str:
    """Format a dollar amount nicely."""
    return f"${amount:,.2f}"

# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "BillMaster ML Service v2.0 is running"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# ─── /api/ml/analyze ──────────────────────────────────────────────────────────

@app.post("/api/ml/analyze")
def analyze_spending(req: InsightsRequest):
    if not req.transactions:
        return {"insights": []}

    df = build_df(req.transactions)
    if df.empty:
        return {"insights": []}

    now = pd.Timestamp.now(tz='UTC')
    insights = []

    # ── 1. Anomaly Detection (Z-score > 2) ────────────────────────────────────
    mean_val = df['amount'].mean()
    std_val = df['amount'].std()
    if pd.notna(std_val) and std_val > 0:
        anomalies = df[df['amount'] > (mean_val + 2 * std_val)].sort_values('amount', ascending=False)
        if not anomalies.empty:
            top = anomalies.iloc[0]
            insights.append({
                "type": "warning",
                "title": "Unusual Expense Detected",
                "description": (
                    f"A transaction of {fmt(top['amount'])} in "
                    f"'{top['category'].title()}' is significantly above your average spend of "
                    f"{fmt(mean_val)}. This may warrant a closer look."
                ),
                "severity": "high"
            })

    # ── 2. Category Concentration ─────────────────────────────────────────────
    cat_sum = df.groupby('category')['amount'].sum().sort_values(ascending=False)
    if not cat_sum.empty:
        top_cat = cat_sum.index[0]
        top_pct = (cat_sum.iloc[0] / cat_sum.sum()) * 100
        if top_pct > 40:
            insights.append({
                "type": "info",
                "title": "High Category Concentration",
                "description": (
                    f"{top_pct:.1f}% of your total spending goes to "
                    f"'{top_cat.title()}'. Diversifying your spending or "
                    f"setting a stricter budget for this category could help you save more."
                ),
                "severity": "medium"
            })

    # ── 3. Spending Velocity (last 7 days vs prior 7 days) ────────────────────
    seven_days_ago = now - pd.Timedelta(days=7)
    fourteen_days_ago = now - pd.Timedelta(days=14)
    recent = df[df['date'] >= seven_days_ago]['amount'].sum()
    prior = df[(df['date'] >= fourteen_days_ago) & (df['date'] < seven_days_ago)]['amount'].sum()
    if prior > 0:
        velocity_change = ((recent - prior) / prior) * 100
        if velocity_change > 30:
            insights.append({
                "type": "warning",
                "title": "Spending Accelerating",
                "description": (
                    f"Your spending in the last 7 days ({fmt(recent)}) is "
                    f"{velocity_change:.0f}% higher than the previous week ({fmt(prior)}). "
                    f"If this pace continues, you may exceed your monthly budget."
                ),
                "severity": "high"
            })
        elif velocity_change < -25:
            insights.append({
                "type": "success",
                "title": "Spending Slowing Down",
                "description": (
                    f"Great discipline! Your spending dropped {abs(velocity_change):.0f}% "
                    f"compared to last week ({fmt(prior)} → {fmt(recent)}). "
                    f"Keep it up to hit your savings target."
                ),
                "severity": "low"
            })

    # ── 4. Weekend vs Weekday Spending Pattern ────────────────────────────────
    df['weekday'] = df['date'].dt.dayofweek  # 0=Mon … 6=Sun
    weekend_spend = df[df['weekday'] >= 5]['amount'].sum()
    weekday_spend = df[df['weekday'] < 5]['amount'].sum()
    weekend_days = max(1, df[df['weekday'] >= 5].shape[0])
    weekday_days  = max(1, df[df['weekday'] < 5].shape[0])
    weekend_daily = weekend_spend / weekend_days
    weekday_daily  = weekday_spend / weekday_days
    if weekday_daily > 0 and weekend_daily > weekday_daily * 1.5:
        insights.append({
            "type": "tip",
            "title": "Weekend Spending Spike",
            "description": (
                f"You spend {fmt(weekend_daily)}/day on weekends vs "
                f"{fmt(weekday_daily)}/day on weekdays — "
                f"{((weekend_daily/weekday_daily - 1)*100):.0f}% more. "
                f"Planning weekend activities in advance can cut this gap significantly."
            ),
            "severity": "low"
        })

    # ── 5. Recurring Charges Detection ────────────────────────────────────────
    if 'description' in df.columns and df['description'].str.strip().ne('').any():
        desc_counts = df.groupby('description')['amount'].agg(['count', 'mean'])
        recurring = desc_counts[desc_counts['count'] >= 2]
        if not recurring.empty:
            top_recurring = recurring.sort_values('count', ascending=False).head(3)
            names = ', '.join([f"'{n}'" for n in top_recurring.index[:2]])
            total_recurring = (top_recurring['count'] * top_recurring['mean']).sum()
            insights.append({
                "type": "info",
                "title": "Recurring Charges Detected",
                "description": (
                    f"We found {len(recurring)} recurring charge(s) totalling "
                    f"~{fmt(total_recurring)}, including {names}. "
                    f"Review these subscriptions to make sure they're all still needed."
                ),
                "severity": "low"
            })

    # ── 6. Month-over-Month Trend ─────────────────────────────────────────────
    df['month'] = df['date'].dt.to_period('M')
    monthly = df.groupby('month')['amount'].sum().sort_index()
    if len(monthly) >= 2:
        last_m = float(monthly.iloc[-1])
        prev_m = float(monthly.iloc[-2])
        if prev_m > 0:
            mom_change = ((last_m - prev_m) / prev_m) * 100
            if abs(mom_change) > 15:
                direction = "up" if mom_change > 0 else "down"
                emoji_word = "increased" if mom_change > 0 else "decreased"
                t = "warning" if mom_change > 0 else "success"
                insights.append({
                    "type": t,
                    "title": f"Month-over-Month Spend {emoji_word.title()}",
                    "description": (
                        f"Your spending {emoji_word} by {abs(mom_change):.1f}% "
                        f"({fmt(prev_m)} → {fmt(last_m)}) compared to last month. "
                        + ("Consider reviewing your budget allocations." if direction == "up"
                           else "Excellent financial discipline — keep maintaining this trend!")
                    ),
                    "severity": "medium" if mom_change > 0 else "low"
                })

    # ── 7. Savings Momentum ───────────────────────────────────────────────────
    # If spending is consistently low in current month (< 60% of monthly avg), give a tip
    current_month_spend = df[df['date'].dt.month == now.month]['amount'].sum()
    avg_monthly = df.groupby(df['date'].dt.to_period('M'))['amount'].sum().mean()
    if avg_monthly > 0 and current_month_spend < avg_monthly * 0.6 and now.day > 10:
        insights.append({
            "type": "success",
            "title": "Strong Savings Momentum",
            "description": (
                f"You've only spent {fmt(current_month_spend)} this month so far, "
                f"which is {((1 - current_month_spend/avg_monthly)*100):.0f}% below your "
                f"monthly average of {fmt(avg_monthly)}. You're on track for an exceptional month!"
            ),
            "severity": "low"
        })

    return {"insights": insights}


# ─── /api/ml/predict-savings ─────────────────────────────────────────────────

@app.post("/api/ml/predict-savings")
def predict_savings(req: PredictSavingsRequest):
    if not req.transactions:
        return {
            "projected_spend": 0,
            "variance": req.targetSavingsAmount * -1 if req.monthlySalary > 0 else 0,
            "status": "on_track",
            "advice": "No recent spending detected. You're well on your way to your savings goal!",
            "daily_run_rate": 0,
            "current_month_spend": 0,
            "days_remaining": 0,
            "savings_rate_pct": 100.0 if req.monthlySalary > 0 else 0,
        }

    df = build_df(req.transactions)
    if df.empty:
        return {
            "projected_spend": 0,
            "variance": 0,
            "status": "on_track",
            "advice": "Could not parse transaction dates.",
            "daily_run_rate": 0,
            "current_month_spend": 0,
            "days_remaining": 0,
            "savings_rate_pct": 0,
        }

    now = pd.Timestamp.now(tz='UTC')

    # 7-day run rate
    seven_days_ago = now - pd.Timedelta(days=7)
    recent_df = df[df['date'] >= seven_days_ago]
    seven_day_spend = recent_df['amount'].sum()
    daily_run_rate = seven_day_spend / 7 if seven_day_spend > 0 else 0

    # Project end-of-month spend
    days_in_month = pd.Period(now.strftime('%Y-%m')).days_in_month
    days_elapsed = now.day
    days_remaining = max(1, days_in_month - days_elapsed)

    current_month_spend = df[df['date'].dt.month == now.month]['amount'].sum()
    projected_eom_spend = float(current_month_spend) + (daily_run_rate * days_remaining)

    # Allowable spend = salary - savings target
    allowable_spend = req.monthlySalary - req.targetSavingsAmount
    variance = projected_eom_spend - allowable_spend

    # Top category in recent spending
    if not recent_df.empty:
        cat_group = recent_df.groupby('category')['amount'].sum()
        top_cat = cat_group.idxmax()
        top_cat_amount = float(cat_group.max())
        weekly_cut_needed = (variance / days_remaining) * 7 if variance > 0 else 0
    else:
        top_cat = "General"
        top_cat_amount = 0
        weekly_cut_needed = 0

    # Savings rate based on projected numbers
    savings_rate_pct = 0.0
    if req.monthlySalary > 0:
        projected_savings = req.monthlySalary - projected_eom_spend
        savings_rate_pct = round((projected_savings / req.monthlySalary) * 100, 1)

    # Build advice
    if variance > 0:
        pct_over = round((variance / allowable_spend) * 100, 1) if allowable_spend > 0 else 0
        advice = (
            f"You're projected to overspend your budget by {fmt(variance)} this month. "
            f"Your top spending area, '{top_cat.title()}', accounts for {fmt(top_cat_amount)} of recent spend. "
            f"Cutting {fmt(weekly_cut_needed)}/week from this category would get you back on track."
        )
        status = "at_risk"
    else:
        surplus = abs(variance)
        advice = (
            f"Excellent! You're projected to end the month {fmt(surplus)} under budget, "
            f"potentially saving {fmt(req.monthlySalary - projected_eom_spend)} in total. "
            f"Your spending rate of {fmt(daily_run_rate)}/day is well-controlled."
        )
        status = "on_track"

    return {
        "projected_spend": round(projected_eom_spend, 2),
        "variance": round(variance, 2),
        "status": status,
        "advice": advice,
        "daily_run_rate": round(daily_run_rate, 2),
        "current_month_spend": round(float(current_month_spend), 2),
        "days_remaining": days_remaining,
        "savings_rate_pct": savings_rate_pct,
    }


# ─── /api/ml/chat ─────────────────────────────────────────────────────────────

QUESTION_PATTERNS: List[Dict[str, Any]] = [
    # Spending total
    {"pattern": r"how much (did i spend|have i spent|am i spending)",
     "handler": "total_spend"},
    {"pattern": r"(total|overall) spend(ing)?",
     "handler": "total_spend"},
    # Top category
    {"pattern": r"(top|highest|most|biggest) (category|categor|spending|expense)",
     "handler": "top_category"},
    # Savings
    {"pattern": r"(how much|am i) sav(ing|e|ed|ings)",
     "handler": "savings"},
    {"pattern": r"saving(s)? (rate|progress|target|goal)",
     "handler": "savings"},
    # Budget
    {"pattern": r"budget",
     "handler": "budget"},
    # Trend
    {"pattern": r"(trend|increas|decreas|go(ing)? up|go(ing)? down|compar)",
     "handler": "trend"},
    # Recurring
    {"pattern": r"(recurring|subscriptions?|repeat)",
     "handler": "recurring"},
    # Average
    {"pattern": r"(average|avg|typical|normal) (spend|expense|transaction)",
     "handler": "average"},
    # Weekend
    {"pattern": r"weekend",
     "handler": "weekend"},
]

@app.post("/api/ml/chat")
def chat(req: ChatRequest):
    question_lower = req.question.lower().strip()

    # Fallback if no transactions
    if not req.transactions:
        return {
            "answer": "I don't have any transactions to analyze yet. Add some expenses and I'll be able to give you personalized insights!"
        }

    df = build_df(req.transactions)
    if df.empty:
        return {"answer": "I couldn't read your transaction data. Please try again."}

    now = pd.Timestamp.now(tz='UTC')

    # Determine which handler to use
    matched_handler = None
    for p in QUESTION_PATTERNS:
        if re.search(p["pattern"], question_lower):
            matched_handler = p["handler"]
            break

    # ── Handler: total spend ───────────────────────────────────────────────────
    if matched_handler == "total_spend":
        total = df['amount'].sum()
        this_month = df[df['date'].dt.month == now.month]['amount'].sum()
        cat_breakdown = df.groupby('category')['amount'].sum().sort_values(ascending=False).head(3)
        breakdown_str = ", ".join([f"{c.title()}: {fmt(v)}" for c, v in cat_breakdown.items()])
        answer = (
            f"Your total spending across all recorded transactions is **{fmt(total)}**. "
            f"This month alone, you've spent **{fmt(this_month)}**. "
            f"Your top categories are: {breakdown_str}."
        )

    # ── Handler: top category ─────────────────────────────────────────────────
    elif matched_handler == "top_category":
        cat_sum = df.groupby('category')['amount'].sum().sort_values(ascending=False)
        top_cat = cat_sum.index[0]
        top_val = cat_sum.iloc[0]
        pct = (top_val / cat_sum.sum()) * 100
        answer = (
            f"Your highest spending category is **{top_cat.title()}** at **{fmt(top_val)}**, "
            f"which makes up {pct:.1f}% of your total spend. "
            f"Here are your top 3 categories:\n"
            + "\n".join([f"• {c.title()}: {fmt(v)}" for c, v in cat_sum.head(3).items()])
        )

    # ── Handler: savings ──────────────────────────────────────────────────────
    elif matched_handler == "savings":
        salary = req.monthlySalary
        target = req.targetSavingsAmount
        this_month_spend = df[df['date'].dt.month == now.month]['amount'].sum()
        if salary > 0:
            remaining = salary - float(this_month_spend)
            rate = (remaining / salary) * 100
            vs_target = remaining - target
            status = "on track ✅" if vs_target >= 0 else "behind target ⚠️"
            answer = (
                f"Based on your monthly salary of {fmt(salary)}, you've spent {fmt(float(this_month_spend))} "
                f"this month, leaving **{fmt(remaining)}** ({rate:.1f}% of income). "
                f"Your savings target is {fmt(target)}, so you're **{status}** "
                f"({'ahead by ' + fmt(vs_target) if vs_target >= 0 else 'behind by ' + fmt(abs(vs_target))})."
            )
        else:
            total_spend = df['amount'].sum()
            answer = (
                f"You've recorded {fmt(total_spend)} in total expenses. "
                f"To get a savings rate, set your monthly salary in Settings so I can calculate how much you're saving."
            )

    # ── Handler: budget ───────────────────────────────────────────────────────
    elif matched_handler == "budget":
        allowable = req.monthlySalary - req.targetSavingsAmount if req.monthlySalary > 0 else 0
        this_month = df[df['date'].dt.month == now.month]['amount'].sum()
        if allowable > 0:
            used_pct = (float(this_month) / allowable) * 100
            answer = (
                f"Your spending budget this month is **{fmt(allowable)}** "
                f"(salary {fmt(req.monthlySalary)} minus savings goal {fmt(req.targetSavingsAmount)}). "
                f"You've used **{fmt(float(this_month))} ({used_pct:.1f}%)** so far. "
                + ("You're within budget. 🟢" if used_pct <= 100 else f"⚠️ You've exceeded your budget by {fmt(float(this_month) - allowable)}!")
            )
        else:
            answer = "Set your monthly salary and savings goal in Settings, and I'll track your budget for you."

    # ── Handler: trend ────────────────────────────────────────────────────────
    elif matched_handler == "trend":
        monthly = df.groupby(df['date'].dt.to_period('M'))['amount'].sum().sort_index()
        if len(monthly) >= 2:
            months_list = [(str(p), round(float(v), 2)) for p, v in monthly.tail(3).items()]
            last_m = float(monthly.iloc[-1])
            prev_m = float(monthly.iloc[-2])
            change = ((last_m - prev_m) / prev_m * 100) if prev_m > 0 else 0
            direction = "📈 increased" if change > 0 else "📉 decreased"
            trend_str = "\n".join([f"• {m}: {fmt(v)}" for m, v in months_list])
            answer = (
                f"Your spending has {direction} by {abs(change):.1f}% compared to last month.\n\n"
                f"Recent monthly breakdown:\n{trend_str}"
            )
        else:
            answer = "I need at least 2 months of data to identify spending trends. Keep adding transactions!"

    # ── Handler: recurring ────────────────────────────────────────────────────
    elif matched_handler == "recurring":
        if 'description' in df.columns:
            desc_counts = df.groupby('description').agg(count=('amount', 'count'), avg=('amount', 'mean'))
            recurring = desc_counts[desc_counts['count'] >= 2].sort_values('count', ascending=False)
            if not recurring.empty:
                items = "\n".join([f"• '{name}': {int(row['count'])}x avg {fmt(row['avg'])}"
                                   for name, row in recurring.head(5).iterrows()])
                total = (recurring['count'] * recurring['avg']).sum()
                answer = f"I found **{len(recurring)} recurring charges** totalling ~{fmt(total)}:\n\n{items}"
            else:
                answer = "I didn't find any clearly recurring charges in your transaction history."
        else:
            answer = "Transaction descriptions aren't available — I can't detect recurring charges without them."

    # ── Handler: average ──────────────────────────────────────────────────────
    elif matched_handler == "average":
        avg = df['amount'].mean()
        median = df['amount'].median()
        count = len(df)
        answer = (
            f"Your average transaction is **{fmt(avg)}** (median: {fmt(median)}) "
            f"across {count} recorded transactions."
        )

    # ── Handler: weekend ──────────────────────────────────────────────────────
    elif matched_handler == "weekend":
        df['is_weekend'] = df['date'].dt.dayofweek >= 5
        weekend = df[df['is_weekend']]['amount'].sum()
        weekday = df[~df['is_weekend']]['amount'].sum()
        wknd_pct = (weekend / (weekend + weekday) * 100) if (weekend + weekday) > 0 else 0
        answer = (
            f"You spend **{fmt(weekend)}** on weekends ({wknd_pct:.1f}% of total) "
            f"vs **{fmt(weekday)}** on weekdays. "
            + ("Weekend spending is notably high — planning ahead could help reduce impulse purchases."
               if wknd_pct > 40 else "Your weekend spending looks balanced.")
        )

    # ── Fallback: general summary ─────────────────────────────────────────────
    else:
        total = df['amount'].sum()
        count = len(df)
        cat_sum = df.groupby('category')['amount'].sum().sort_values(ascending=False)
        top = cat_sum.index[0] if not cat_sum.empty else "N/A"
        this_month = df[df['date'].dt.month == now.month]['amount'].sum()
        answer = (
            f"Here's a quick financial summary:\n\n"
            f"• **Total spend recorded**: {fmt(total)} across {count} transactions\n"
            f"• **This month**: {fmt(float(this_month))}\n"
            f"• **Top category**: {top.title()}\n\n"
            f"You can ask me things like:\n"
            f"\"How much did I spend on food?\"\n"
            f"\"What's my savings rate?\"\n"
            f"\"Am I on budget this month?\"\n"
            f"\"Show me my spending trend\""
        )

    return {"answer": answer}
