# DP Paid Not Converted — Payment Link Reminder System

A specialized EdTech sales operations platform designed to track down-payment (DP) links sent to prospective students, automatically identify pending payments breaching the 24-hour SLA window, alert responsible Business Development (BD) executives, and track conversion workflows.

---

## 🏗️ Architecture & Stack

* **Backend**: FastAPI (Python 3.10+) with Async Motor (MongoDB Driver)
* **Frontend**: React 18+ powered by **Vite** (Instant HMR, clean `.jsx` architecture)
* **Database**: MongoDB (Collections: `users`, `courses`, `leads`, `payment_links`, `reminders`)
* **Background Worker**: Asyncio SLA evaluator running every 60 seconds

---

## 🚀 How to Run the Project

### 1. Prerequisites
* **Python 3.10 or higher**: [Download Python](https://www.python.org/)
* **Node.js (v18+) & npm**: [Download Node.js](https://nodejs.org/)
* **MongoDB**: Running locally on `mongodb://localhost:27017` (or Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`)

---

### 2. Start the Backend Server (FastAPI)

Open a terminal window and execute:

```powershell
# Navigate to the server folder
cd server

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI backend server
python main.py
```

> 🌐 **Backend URL**: [http://localhost:8000](http://localhost:8000)  
> 📑 **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)  
> *Note: On startup, the backend automatically seeds initial sample BDs (`Rahul Sharma`, `Priya Patel`, `Amit Kumar`), Courses, Leads, and sample Pending/Overdue links if the database is empty.*

---

### 3. Start the Frontend Application (React)

Open a **second** terminal window and execute:

```powershell
# Navigate to the client folder
cd client

# Install frontend dependencies (if not already installed)
npm install

# Start the React development server
npm run dev
```

> 💻 **Frontend URL**: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Key Features & Workflows

1. **BD Profile Switcher**: Easily toggle between BD accounts in the top navigation bar to view their specific assigned leads, active payment links, and overdue reminders.
2. **🚨 Overdue Follow-up Queue**: Real-time queue showing payment links that have breached the 24-hour threshold with live overdue aging timer (e.g. *Overdue by 4h 15m*).
3. **📝 Interaction & Audit Logging**: BDs can log notes after calling leads (e.g., *"Student requested evening 7 PM UPI transfer"*).
4. **⚡ One-Click Payment Simulation**: Test gateway webhook callbacks directly from the UI. Simulating payment immediately marks the link as `PAID`, resolves the active reminder, and updates the lead to `CONVERTED`.
5. **➕ Lead & Link Creation**: Generate custom down-payment links for leads with customizable validity rules (24h standard, 4h, or 1-minute quick demo test).
6. **🔄 Real-time Background SLA Check**: Background worker runs every 60 seconds and on-demand via the simulator toolbar.

---

## 📁 Project Structure

```
dp-collection/
├── README.md
├── server/
│   ├── main.py                  # FastAPI entrypoint with background SLA worker
│   ├── database.py              # Motor Async MongoDB client & auto-seeder
│   ├── requirements.txt         # Python dependencies
│   ├── services/
│   │   └── overdue_service.py   # Overdue SLA evaluation engine
│   ├── models/                  # Pydantic schemas (User, Course, Lead, PaymentLink, Reminder)
│   └── routers/                 # Modular REST API endpoints
└── client/
    ├── package.json
    ├── public/
    │   └── index.html           # HTML container
    └── src/
        ├── index.jsx            # React root mount
        ├── App.jsx              # Main Dashboard app
        ├── App.css              # Dashboard styling
        ├── api.js               # Centralized Axios API client
        └── components/          # Modular UI components
            ├── Header.jsx
            ├── SimulatorBar.jsx
            ├── OverdueQueue.jsx
            ├── PaymentLinksTable.jsx
            ├── LeadsTable.jsx
            ├── FollowUpModal.jsx
            ├── GenerateLinkModal.jsx
            └── AddLeadModal.jsx
```
