# 💰 BillMaster — Smart Expense Tracking

A full-stack finance management platform with ML-powered insights, real-time notifications, and a premium dark-first UI.

---

## 🚀 Quick Start (3 Steps)

### Step 1 — Install all dependencies

```bash
npm run install:all
```

### Step 2 — Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or use MongoDB Atlas — set MONGODB_URI in server/.env
```

### Step 3 — Run both servers

```bash
npm run dev
```

This starts:
- **Frontend** → http://localhost:5173 (Vite)
- **Backend** → http://localhost:5001 (Express + Socket.io)

---

## 🔧 Port Configuration (IMPORTANT)

The server now runs on **port 5001** (changed from 5000).

**Why?** Port 5000 is commonly used by AirPlay on macOS and many other dev tools, causing `EADDRINUSE` crashes.

| Service | Port | Config File |
|---------|------|-------------|
| Frontend (Vite) | 5173 | `vite.config.js` |
| Backend (Express) | **5001** | `server/.env` → `PORT=5001` |
| ML Service (FastAPI) | 8000 | `ml-service/main.py` |

To use a different port, edit `server/.env`:
```env
PORT=5001  # Change this if needed
```

---

## 📁 Project Structure

```
BillMaster/
├── src/                    # React frontend (Vite)
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # DashboardLayout, ParticleBackground
│   │   └── ui/             # Button, Card, Input, Modal, etc.
│   ├── context/            # AuthContext, ThemeContext
│   ├── pages/              # All page components
│   ├── services/           # API service layer
│   └── data/               # Mock data & categories
│
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, error handling
│   │   └── config/         # DB, app config
│   ├── uploads/            # User-uploaded files (avatars, CSVs)
│   └── server.js           # Entry point
│
├── ml-service/             # FastAPI ML service (Python)
│   ├── main.py             # Spending analysis & anomaly detection
│   └── requirements.txt
│
├── .env                    # Frontend env vars (VITE_API_URL)
├── server/.env             # Backend env vars (PORT, MONGODB_URI, JWT_SECRET)
└── vite.config.js          # Vite + proxy config
```

---

## ✅ Features

### Core
- **Authentication** — JWT-based login/register with bcrypt passwords
- **Dashboard** — Real-time stats, charts, budget progress, insights
- **Onboarding Wizard** — Set up salary and first budget on first login
- **Expenses** — Full CRUD, categories, pagination, search, filter
- **Budgets** — Monthly budget limits with progress tracking
- **Income** — Track salary and recurring income sources

### Connected Accounts
- Connect Google Pay / UPI / Bank (simulated UI)
- Upload CSV transaction files to import expenses in bulk
- Transactions parsed and saved to MongoDB

### Analytics
- Spending trends chart (Area chart — income vs expenses)
- Category breakdown (Pie chart)
- Budget vs Actual (Bar chart)
- ML-powered anomaly detection and spending insights
- Savings projection widget

### Notifications
- Real-time notification bell in dashboard header
- In-app notifications from ML insights and budget alerts
- Socket.io WebSocket integration

### Settings
- Dark / Light / System theme toggle (persists in localStorage)
- Profile photo upload with preview
- Profile details update (name, currency, financial goal)
- Password change

---

## 🐍 ML Service (Optional but Recommended)

The ML service provides spending anomaly detection and smart insights.

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Without the ML service, the Analytics page still works but Smart Insights will be empty (graceful degradation).

---

## 🌍 Environment Variables

### Frontend (`/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_WS_URL=http://localhost:5001
```

### Backend (`/server/.env`)
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/billmaster
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## 🛠️ Known Limitations

1. **ML Service** — FastAPI service must be started separately (`uvicorn main:app --port 8000`)
2. **Cloudinary** — Avatar uploads are stored locally in `server/uploads/`. Add Cloudinary env vars for cloud storage
3. **CSV Import** — Expects format: `Date,Description,Amount,Category` (one header row)
4. **OAuth** — Google Pay / UPI connections are simulated (no real OAuth)

---

## 📝 Fixed in This Version

| Bug | Fix |
|-----|-----|
| `EADDRINUSE :::5000` server crash | Changed default port to 5001; added port-conflict detection |
| Login 401 CORS errors | Port mismatch fixed; Vite proxy configured |
| `Bearer ` token with whitespace | Added `.trim()` in api.js interceptor |
| Settings page crash (`login` as setUser) | Added `updateUser` to AuthContext; fixed SettingsPage |
| React SVG hydration crash in dropdowns | Was already fixed in existing code |

