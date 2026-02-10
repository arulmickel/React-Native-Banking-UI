# 🏦 React Native Banking UI

A multi-screen banking front-end prototype built with React Native, demonstrating reusable component architecture, responsive layouts, mock REST API integration, unit testing, and Section 508/WCAG accessibility compliance.

---

## 📱 Screenshots

### Mobile (Android — Expo Go)

| Account Summary | Transactions | Savings Detail |
|:-:|:-:|:-:|
| <img src="screenshots/phone%20Screenshot%201%20%281%29.png" width="260" alt="Account Summary" /> | <img src="screenshots/phone%20Screenshot%201%20%282%29.png" width="260" alt="Transactions" /> | <img src="screenshots/phone%20Screenshot%201%20%283%29.png" width="260" alt="Savings Detail" /> |
| Dashboard with total balance and tappable account cards | Filterable transaction history with category chips | Account detail with transfer and interest history |

### 🖥️ Web (React Native Web)

<img src="screenshots/web%20Screenshot.png" width="1000" alt="Web Dashboard" />

*Responsive web version rendered via `react-native-web` — same codebase, zero modifications.*

> If you still see 404 images on GitHub: make sure the screenshots are **committed & pushed** and the folder name is exactly `screenshots` (case-sensitive on GitHub).

---

## Features

### 📱 Multi-Screen Application
- **Account Summary** — Dashboard showing total balance across all accounts with tappable account cards
- **Transaction History** — Filterable transaction list with category chips, pull-to-refresh, and empty states
- **Transfer Flow** — 3-step fund transfer (Form → Review → Confirmation) with real-time validation

### 🧩 Reusable Component Library
- `AccountCard` — Displays account summary with type badge, balance, and APY
- `TransactionItem` — Transaction row with category icon, amount formatting, and relative dates
- `Button` — Primary/secondary/outline variants with loading and disabled states
- `LoadingState` / `ErrorState` — Consistent loading and error UI with retry support

### 🔌 Mock REST API Layer
- Simulates real API calls with configurable network latency (300–800ms)
- Follows REST conventions: `GET /accounts`, `GET /accounts/:id/transactions`, `POST /transfers`
- Supports pagination, error simulation, and in-memory balance updates
- Easy to swap with real endpoints — just replace function bodies in `bankingApi.js`

### ✅ Unit Testing
- **30+ test cases** covering formatters, API client, and validation logic
- Tests for edge cases: null inputs, NaN, overflow, empty data, invalid IDs
- STAR-aligned: each test documents the **Situation**, **Action**, and expected **Result**

### ♿ Accessibility (Section 508 / WCAG 2.1)
- **Semantic Labels**: Every interactive element has `accessibilityLabel` and `accessibilityRole`
- **Focus Order**: Logical reading order; form errors use `accessibilityLiveRegion="assertive"`
- **Contrast-Aware UI**: All text meets WCAG AA contrast ratios (minimum 4.5:1 for body text)
- **Touch Targets**: All buttons and interactive elements meet 44dp minimum (WCAG 2.5.5)
- **Non-Color Indicators**: Transaction amounts use sign (+/-) and icons, never color alone
- **Screen Reader Support**: `accessibilityHint` on buttons, grouped elements with meaningful labels

---

## Architecture

