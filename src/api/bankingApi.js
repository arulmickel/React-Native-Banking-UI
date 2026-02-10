/**
 * Mock API Client
 *
 * Simulates REST API calls with realistic network latency.
 * In production, replace each method with actual fetch/axios calls
 * to the banking backend (e.g., GET /api/v1/accounts).
 *
 * Design decisions:
 *   - All methods return Promises to mirror real HTTP calls
 *   - Configurable delay simulates network conditions
 *   - Random failure simulation for testing error states
 *   - Response shape matches typical REST API conventions
 */

import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_USER } from './mockData';

// Simulated network delay range (ms)
const MIN_DELAY = 300;
const MAX_DELAY = 800;

// Probability of simulated failure (set to 0 for demos, 0.1 for testing)
const FAILURE_RATE = 0;

/**
 * Simulates network latency with a random delay.
 * @returns {Promise<void>}
 */
function simulateNetworkDelay() {
  const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Optionally throws a simulated network error.
 * Used to test error states in the UI.
 */
function maybeThrowError() {
  if (Math.random() < FAILURE_RATE) {
    throw new Error('Network request failed. Please try again.');
  }
}

/**
 * Wraps a data-fetching function with delay + error simulation.
 * @param {Function} fetcher - Function that returns the data
 * @returns {Promise<Object>} API response shape: { data, status, timestamp }
 */
async function apiCall(fetcher) {
  await simulateNetworkDelay();
  maybeThrowError();

  const data = fetcher();
  return {
    data,
    status: 200,
    timestamp: new Date().toISOString(),
  };
}

// ─── PUBLIC API ──────────────────────────────────────────────

/**
 * GET /api/v1/user
 * Fetches the current user profile.
 */
export async function fetchUser() {
  return apiCall(() => MOCK_USER);
}

/**
 * GET /api/v1/accounts
 * Fetches all accounts for the current user.
 */
export async function fetchAccounts() {
  return apiCall(() => MOCK_ACCOUNTS);
}

/**
 * GET /api/v1/accounts/:id
 * Fetches a single account by ID.
 * @param {string} accountId
 */
export async function fetchAccountById(accountId) {
  return apiCall(() => {
    const account = MOCK_ACCOUNTS.find((a) => a.id === accountId);
    if (!account) throw new Error(`Account ${accountId} not found`);
    return account;
  });
}

/**
 * GET /api/v1/accounts/:id/transactions
 * Fetches transactions for a specific account.
 * @param {string} accountId
 * @param {Object} options - { limit, offset } for pagination
 */
export async function fetchTransactions(accountId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  return apiCall(() => {
    const filtered = MOCK_TRANSACTIONS
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      transactions: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  });
}

/**
 * POST /api/v1/transfers
 * Submits a transfer between accounts.
 * @param {Object} transfer - { fromAccountId, toAccountId, amount, memo }
 * @returns {Promise<Object>} Confirmation with reference number
 */
export async function submitTransfer(transfer) {
  const { fromAccountId, toAccountId, amount, memo } = transfer;

  return apiCall(() => {
    // Validate source account exists and has sufficient balance
    const fromAccount = MOCK_ACCOUNTS.find((a) => a.id === fromAccountId);
    if (!fromAccount) throw new Error('Source account not found');
    if (fromAccount.availableBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const toAccount = MOCK_ACCOUNTS.find((a) => a.id === toAccountId);
    if (!toAccount) throw new Error('Destination account not found');

    // Simulate balance update (in-memory only)
    fromAccount.balance -= amount;
    fromAccount.availableBalance -= amount;
    toAccount.balance += amount;
    toAccount.availableBalance += amount;

    // Return confirmation
    return {
      referenceNumber: `TRF-${Date.now().toString(36).toUpperCase()}`,
      fromAccount: fromAccount.name,
      toAccount: toAccount.name,
      amount,
      memo: memo || '',
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
  });
}
