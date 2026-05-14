# 🚀 BillMaster Deployment Guide

This guide provides step-by-step instructions for deploying the BillMaster full-stack platform.

## 🏗️ Architecture Overview
BillMaster consists of three main components that need to be deployed:
1.  **Frontend**: React (Vite) - *Suggested: Vercel or Netlify*
2.  **Backend**: Node.js/Express - *Suggested: Render, Railway, or Fly.io*
3.  **ML Service**: Python/FastAPI - *Suggested: Render or Railway*
4.  **Database**: MongoDB - *Suggested: MongoDB Atlas*

---

## 1️⃣ Database Setup (MongoDB Atlas - FREE)
1.  Create a free account at [mongodb.com](https://www.mongodb.com/cloud/atlas).
2.  When creating a cluster, select the **"Shared"** tier (it's labeled as **FREE**).
3.  Ensure the Cluster Tier is set to **M0 Sandbox**. 
    *   *Note: If it asks for a credit card, you have likely selected M10 or Serverless. Switch back to Shared/M0.*
4.  Pick a provider (AWS/Google/Azure) and a region that says **"Free Tier Available"**.
5.  Create a database named `billmaster`.
6.  Go to **Network Access** and "Allow Access from Anywhere" (0.0.0.0/0).
7.  Go to **Database Access** and create a user (keep the password safe).
8.  Get your **Connection String** (SRV) and replace `<password>` with your actual password.

---

## 2️⃣ ML Service Deployment (Python)
**Platform: [Render.com](https://render.com)**
1.  Connect your GitHub repository.
2.  Create a new **Web Service**.
3.  **Runtime**: `Python 3`
4.  **Build Command**: `pip install -r requirements.txt`
5.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6.  **Environment Variables**:
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `SECRET_KEY`: A random secure string.

---

## 3️⃣ Backend Deployment (Node.js)
**Platform: [Render.com](https://render.com)**
1.  Create a new **Web Service**.
2.  **Runtime**: `Node`
3.  **Build Command**: `npm install` (Ensure you are in the server directory or the root if it's a monorepo).
4.  **Start Command**: `node server.js`
5.  **Environment Variables**:
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A long, random string.
    *   `ML_SERVICE_URL`: The URL of your deployed Python ML Service.
    *   `PORT`: `5000` (or leave default if the platform provides one).
    *   `NODE_ENV`: `production`

---

## 4️⃣ Frontend Deployment (React)
**Platform: [Vercel](https://vercel.com)**
1.  Connect your GitHub repository.
2.  **Framework Preset**: `Vite`
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed Node.js Backend.
    *   `VITE_APP_NAME`: `BillMaster`

---

## 🛠️ Post-Deployment Checklist
- [ ] **CORS Settings**: Ensure your Backend allow-lists your Frontend URL.
- [ ] **Health Check**: Visit `YOUR_BACKEND_URL/api/health` to verify connectivity.
- [ ] **ML Connection**: Test the "AI Insights" on the dashboard to ensure the Backend can talk to the ML Service.
- [ ] **Favicon**: Ensure `public/favicon.svg` (or `.ico`) is correctly displaying.

## 📁 Important File Paths
*   **Backend**: `server/`
*   **ML Service**: `ml_service/`
*   **Frontend**: `src/`

> [!IMPORTANT]
> If you are using a single repository, make sure your deployment platform is configured to point to the correct **Root Directory** for each service.
