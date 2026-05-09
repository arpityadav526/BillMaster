# BillMaster Technical Reference & Context Manifest

This is a comprehensive technical specification for the BillMaster platform. Use this document as a primary context source for debugging, refactoring, or feature extension.

---

## 🏗️ 1. Architecture & Technology Stack

### **Core Stack**
*   **Frontend**: React 19 (Beta), Vite 8, React Router 7, Axios 1.x.
*   **Backend**: Node.js 22.x, Express 5.x (Stable), Mongoose 8.x.
*   **Intelligence**: Python 3.13, FastAPI, Pandas, Scikit-learn.
*   **Communication**: Socket.io 4.x (WebSockets), Nodemailer 6.x (SMTP).

---

## 📂 2. File-by-File Responsibility Mapping

### **A. Backend: `/server/src`**
*   `server.js`: Application entry point. Initializes HTTP server, WebSockets, and database connection.
*   `app.js`: Configures Express middleware (Helmet, CORS, Rate Limit) and mounts all routers.
*   `routes/`:
    *   `auth.js`: Handles `/api/auth` (login, register, me).
    *   `expenses.js`: Handles `/api/expenses` (CRUD + stats).
    *   `analytics.js`: Handles `/api/analytics` (Insights proxy + overview).
    *   `users.js`: Handles `/api/users` (profile, avatar, settings).
*   `services/`:
    *   `authService.js`: Logic for password verification, JWT generation, and User lookups.
    *   `expenseService.js`: Implements pagination, category aggregation, and **Budget Guard** checks.
    *   `notificationService.js`: Interface for creating DB-persisted notifications and emitting socket events.
    *   `analyticsService.js`: Logic for monthly deltas and communication with the Python ML service.
*   `middleware/`:
    *   `auth.js`: JWT verification middleware that attaches `req.user`.
    *   `errorHandler.js`: Normalized error responder (handles Mongoose validation, duplicate keys, and 401s).
*   `jobs/`:
    *   `scheduler.js`: Configures `node-cron` for weekly/monthly insights and salary reminders.
    *   `seed.js`: Script for database sanitization and demographic population.

### **B. Frontend: `/src`**
*   `context/AuthContext.jsx`: Manages `user` state, `initAuth` (token verification), and `login/logout` actions.
*   `services/api.js`: Axios instance with a request interceptor for `Bearer` tokens and a response interceptor for auto-logout.
*   `services/socket.js`: Singleton for WebSocket lifecycle management and event listeners.
*   `pages/DashboardPage.jsx`: Orchestrates the aggregation of 5+ API calls into a unified financial dashboard.
*   `components/layout/DashboardLayout.jsx`: Implements the responsive sidebar and glassmorphism header.

---

## 🗄️ 3. Database Schema Specification (Mongoose)

### **User Collection**
*   `email`: String (Unique, Indexed).
*   `password`: String (Selected: false).
*   `monthlyIncomeTarget`: Number (Default: 5000).
*   `theme`: Enum ['light', 'dark', 'system'].

### **Expense Collection**
*   `user`: ObjectId (Index: 1).
*   `amount`: Number (Min: 0.01).
*   `category`: Enum ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'travel', 'subscriptions', 'other'].
*   `date`: Date (Index: -1).
*   `Compound Index`: `{ user: 1, date: -1 }` and `{ user: 1, category: 1 }`.

### **Budget Collection**
*   `limit`: Number.
*   `month/year`: Number (Integers).
*   `Unique Index`: `{ user: 1, category: 1, month: 1, year: 1 }`.

---

## 🌐 4. API Interface Details (Request/Response)

### **Authentication**
*   `POST /api/auth/login`: `{ email, password }` -> `200 { success, data: { token, user } }`.
*   `GET /api/auth/me`: Requires Header `Authorization: Bearer <token>`.

### **Expense Aggregation**
*   `GET /api/expenses/stats`: Returns current month totals, last month totals, category breakdown array, and 12-month trend array.

### **ML Proxy Flow**
*   `POST /api/ml/analyze`:
    *   **In**: Array of `{ amount, category, date }`.
    *   **Out**: Array of `{ type, title, description, severity }`.
    *   **Logic**: Statistical anomaly detection (Standard Deviation method).

---

## ⚙️ 5. Critical System Workflows

### **1. The "Budget Guard" Logic**
1.  User submits a new expense.
2.  `expenseService` looks for a `Budget` matching `(user, category, currentMonth, currentYear)`.
3.  Calculates `totalSpent` via `$sum` aggregation.
4.  If `totalSpent > budget.limit`:
    *   `notificationService` saves a `Notification`.
    *   `socket.emit('NOTIFICATION_RECEIVED')` is sent.
    *   `nodemailer` triggers a high-priority budget alert email.

### **2. WebSocket Notification Sink**
*   Frontend `socket.js` listens for `NOTIFICATION_RECEIVED`.
*   Triggers an in-app toast and increments the notification bell counter in `DashboardHeader`.

### **3. Graceful ML Degradation**
*   The `analyticsService` wraps the ML proxy call in a silent `try/catch`.
*   If the Python service is offline, the "Smart Insights" section returns an empty array `[]` instead of crashing the dashboard.

---

## 🔑 6. Configuration & Runtime

*   **Server Port**: `5001` (to prevent conflicts with AirPlay).
*   **Client Port**: `5173`.
*   **ML Port**: `8000`.
*   **Rate Limiting**: `1000` requests per 15-minute window.
*   **Security**: `helmet()` for CSP/XSS protection, `cors` configured for specific `CLIENT_URL`.

---
**Note to AI Agents**: When debugging connectivity, always check `server/.env` for correct `MONGODB_URI` and `JWT_SECRET`. The project uses ESM (`"type": "module"`) across all Node.js services.
