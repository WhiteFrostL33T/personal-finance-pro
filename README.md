# Personal Finance Pro 💎

A modern, visually refined, and **100% offline personal finance and wealth tracker**. Built with React, TypeScript, Tailwind CSS, Recharts, and IndexedDB via Dexie.js.

---

## ✨ Highlights & Key Features

- **🛡️ 100% Offline & Private**: All data is stored directly in your browser's IndexedDB. Zero cloud telemetry, no third-party trackers, and no external API dependencies.
- **✨ Aesthetics**: Refined dark slate aesthetic with glowing gradients, smooth micro-interactions, responsive charts, and glassmorphism cards.
- **📊 Real-time Net Worth & Stat Cards**:
  - Net Worth (Assets minus Liabilities)
  - Monthly Inflow (Income tracking)
  - Monthly Outflow (Expense velocity)
  - Live Savings Rate % with target progress
- **📈 Interactive Financial Charts**:
  - **Cash Flow Area Chart**: Income vs. Expenses with date ranges (Last 30 Days or 6 Months)
  - **Category Spending Donut Chart**: Hoverable breakdown with category distributions
- **💳 Multi-Account Management**:
  - Support for Checking, High-Yield Savings, Credit Cards, Investment/Brokerage, and Physical Cash
  - Direct fund transfers between accounts
- **🎯 Category Budgets**:
  - Monthly spending caps with real-time indicators (Safe, Warning >80%, Exceeded >100%)
- **🏆 Savings Goals & Milestones**:
  - Visual target trackers with quick deposits and celebratory confetti upon completion
- **🔍 Filterable Transactions Feed**:
  - Instant search across payees, categories, and tags
  - Filter by transaction type (Income, Expense, Transfer) or Account
- **💾 Complete Backup & Portability**:
  - 1-click JSON database export and restore
  - 1-click CSV transaction export (Excel & Google Sheets compatible)
  - Instant demo reload or clean slate reset
- **🌍 Currency & Preferences**:
  - Customizable currency symbol (`$`, `€`, `£`, `¥`, `CA$`, `A$`, `CHF`, `₹`, etc.) and monthly financial targets

---

## 🚀 Getting Started

The project is located at:
```bash
/home/bazzite/.gemini/antigravity/scratch/personal-finance-pro
```

### Run Locally
```bash
cd /home/bazzite/.gemini/antigravity/scratch/personal-finance-pro
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Production Build
```bash
npm run build
npm run preview
```
