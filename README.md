# ⚡ SplitSmart — Smart Expense Splitting App

A full-stack MERN application to track, split, and settle group expenses with AI-powered smart features.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🧠 Smart Split | AI-powered split suggestions based on payment history |
| 🔄 Debt Simplification | Algorithm minimizes number of settlement transactions |
| ⚡ Real-Time Updates | Socket.io live expense feed — no refresh needed |
| 📊 Fairness Tracker | Visual dashboard tracking who pays fairly over time |
| 🏷️ Category Insights | Auto-tagged expenses with spending analytics |

---

## 📁 Project Structure

```
splitsmart/
├── backend/                  # Node.js + Express + MongoDB
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   └── Settlement.js
│   ├── routes/
│   │   ├── auth.js           # Register, Login, Profile
│   │   ├── groups.js         # CRUD + Balances
│   │   ├── expenses.js       # CRUD + Smart Split
│   │   ├── settlements.js    # Record settlements
│   │   └── insights.js       # Analytics data
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── utils/
│   │   └── debtSimplifier.js # Core algorithm
│   ├── .env
│   └── server.js
│
└── frontend/                 # React.js
    └── src/
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── GroupPage.jsx
        │   └── InsightsPage.jsx
        ├── components/
        │   ├── common/Layout.jsx
        │   ├── groups/CreateGroupModal.jsx
        │   ├── groups/BalancePanel.jsx
        │   ├── groups/AddMemberModal.jsx
        │   ├── expenses/AddExpenseModal.jsx
        │   └── expenses/ExpenseList.jsx
        └── context/
            ├── AuthContext.jsx
            └── SocketContext.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/splitsmart
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
```

Start backend:
```bash
npm run dev      # development (with nodemon)
# or
npm start        # production
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |

### Groups
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/groups` | List user's groups |
| POST | `/api/groups` | Create group |
| GET  | `/api/groups/:id` | Get group details |
| PUT  | `/api/groups/:id` | Update group |
| DELETE | `/api/groups/:id` | Delete group |
| POST | `/api/groups/:id/members` | Add member |
| GET  | `/api/groups/:id/balances` | Get simplified debts |

### Expenses
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/expenses/group/:groupId` | List group expenses |
| GET  | `/api/expenses/smart-split/:groupId?amount=X` | Smart split suggestion |
| POST | `/api/expenses` | Add expense |
| PUT  | `/api/expenses/:id` | Edit expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Settlements
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/settlements/group/:groupId` | List settlements |
| POST | `/api/settlements` | Record settlement |

### Insights
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/insights/group/:groupId` | Get analytics |

---

## 🧠 Debt Simplification Algorithm

The core algorithm in `utils/debtSimplifier.js` works like this:

1. Calculates net balance for each member (positive = owed, negative = owes)
2. Splits members into creditors and debtors
3. Uses a greedy two-pointer approach to match largest debts with largest credits
4. Result: **minimum number of transactions** to settle all debts

Example: 6 members with 15 individual debts → reduced to 5 transactions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Real-time | Socket.io |
| Auth | JWT (JSON Web Tokens) |
| Styling | CSS-in-JS with CSS variables |

---

## 📸 App Flow

1. **Register/Login** → Secure JWT auth
2. **Dashboard** → View all groups with stats
3. **Create Group** → Add name, category, emoji, invite members by email
4. **Add Expense** → Choose split type (Equal / Smart / Custom / Percentage)
5. **View Balances** → Simplified debt transactions
6. **Insights** → Charts, fairness scores, spending analytics
7. **Settle** → One-click settlement recording

---

*Built with ❤️ using MERN Stack*
