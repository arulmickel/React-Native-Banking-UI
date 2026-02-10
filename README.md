# React Native Banking UI

A multi-screen banking front-end prototype built with React Native, demonstrating reusable component architecture, responsive layouts, mock REST API integration, unit testing, and Section 508/WCAG accessibility compliance.

---

## Screenshots

### Mobile (android/ios | Expo Go)

| Account Summary | Transactions | Savings Detail |
|:-:|:-:|:-:|
| <img src="screenshots/phone%20Screenshot%201%20%281%29.png" width="260" alt="Account Summary" /> | <img src="screenshots/phone%20Screenshot%201%20%282%29.png" width="260" alt="Transactions" /> | <img src="screenshots/phone%20Screenshot%201%20%283%29.png" width="260" alt="Savings Detail" /> |
| Dashboard with total balance and tappable account cards | Filterable transaction history with category chips | Account detail with transfer and interest history |

### Web (React Native Web)

<img src="screenshots/web%20Screenshot.png" width="1000" alt="Web Dashboard" />

*Responsive web version rendered via `react-native-web` - same codebase, zero modifications.*

> If you still see 404 images on GitHub: make sure the screenshots are **committed & pushed** and the folder name is exactly `screenshots` (case-sensitive on GitHub).

---

## Features

### Multi-Screen Application
- **Account Summary** - Dashboard showing total balance across all accounts with tappable account cards
- **Transaction History** - Filterable transaction list with category chips, pull-to-refresh, and empty states
- **Transfer Flow** - 3-step fund transfer (Form → Review → Confirmation) with real-time validation

### Reusable Component Library
- `AccountCard` - Displays account summary with type badge, balance, and APY
- `TransactionItem` - Transaction row with category icon, amount formatting, and relative dates
- `Button` - Primary/secondary/outline variants with loading and disabled states
- `LoadingState` / `ErrorState` - Consistent loading and error UI with retry support

### Mock REST API Layer
- Simulates real API calls with configurable network latency (300–800ms)
- Follows REST conventions: `GET /accounts`, `GET /accounts/:id/transactions`, `POST /transfers`
- Supports pagination, error simulation, and in-memory balance updates
- Easy to swap with real endpoints - just replace function bodies in `bankingApi.js`

### Unit Testing
- **30+ test cases** covering formatters, API client, and validation logic
- Tests for edge cases: null inputs, NaN, overflow, empty data, invalid IDs
- STAR-aligned: each test documents the **Situation**, **Action**, and expected **Result**

### Accessibility (Section 508 / WCAG 2.1)
- **Semantic Labels**: Every interactive element has `accessibilityLabel` and `accessibilityRole`
- **Focus Order**: Logical reading order; form errors use `accessibilityLiveRegion="assertive"`
- **Contrast-Aware UI**: All text meets WCAG AA contrast ratios (minimum 4.5:1 for body text)
- **Touch Targets**: All buttons and interactive elements meet 44dp minimum (WCAG 2.5.5)
- **Non-Color Indicators**: Transaction amounts use sign (+/-) and icons, never color alone
- **Screen Reader Support**: `accessibilityHint` on buttons, grouped elements with meaningful labels

---

## Architecture

```
src/
├── api/
│   ├── mockData.js          # Static mock data (accounts, transactions)
│   ├── bankingApi.js         # Mock REST API client with delay simulation
│   └── index.js              # Clean re-exports
├── components/
│   ├── AccountCard.js        # Reusable account summary card
│   ├── TransactionItem.js    # Transaction list row
│   ├── Button.js             # Multi-variant button
│   ├── LoadingState.js       # Loading spinner
│   ├── ErrorState.js         # Error with retry
│   └── index.js
├── hooks/
│   └── useFetch.js           # Custom hook for async data fetching
├── navigation/
│   └── AppNavigator.js       # Tab + stack navigation setup
├── screens/
│   ├── AccountSummaryScreen.js  # Home dashboard
│   ├── TransactionsScreen.js    # Transaction history with filters
│   ├── TransferScreen.js        # Multi-step transfer flow
│   └── index.js
├── utils/
│   ├── theme.js              # WCAG-compliant design tokens
│   └── formatters.js         # Pure utility functions
└── __tests__/
    ├── formatters.test.js    # 20+ formatter & validation tests
    └── bankingApi.test.js    # 10+ API client tests
```

### Key Design Decisions

| Decision | Why |
|----------|-----|
| **Mock API with Promises** | Mirrors real HTTP calls, making production swap seamless |
| **Custom `useFetch` hook** | Encapsulates loading/error/data state, reduces boilerplate |
| **Pure formatter functions** | Easy to unit test, no side effects, single responsibility |
| **Theme tokens** | Centralized design system with WCAG-verified contrast ratios |
| **Component composition** | Small, focused components that are independently testable |
| **3-step transfer state machine** | Clear user flow with review step preventing accidental transfers |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android) for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/arulmickel/React-Native-Banking-UI.git
cd React-Native-Banking-UI

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

### Running on Device
1. Install **Expo Go** from the App Store / Play Store
2. Scan the QR code shown in the terminal
3. The app will load on your phone

### Running on Web
```bash
npx expo start --web
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native (Expo) | Cross-platform mobile framework |
| React Navigation | Tab + stack navigation |
| JavaScript (ES6+) | Application language |
| Jest | Unit testing framework |
| React Testing Library | Component testing utilities |
| react-native-web | Web platform support |

---

## Future Enhancements

- [ ] TypeScript migration for type safety
- [ ] Biometric authentication (FaceID/TouchID)
- [ ] Real API integration with interceptors
- [ ] Dark mode with automatic system theme detection
- [ ] Redux/Zustand for global state management
- [ ] E2E tests with Detox
- [ ] Push notification integration for transaction alerts
- [ ] Localization (i18n) support

---

## License

MIT


