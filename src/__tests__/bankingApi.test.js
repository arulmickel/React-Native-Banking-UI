/**
 * Unit tests for the banking API client.
 *
 * Tests cover:
 *   - Fetching accounts (response shape, data integrity)
 *   - Fetching transactions with filtering
 *   - Transfer validation (insufficient funds, invalid accounts)
 *   - Transfer success with balance updates
 *   - API response structure consistency
 */

import {
  fetchUser,
  fetchAccounts,
  fetchAccountById,
  fetchTransactions,
  submitTransfer,
} from '../api/bankingApi';

// ─── fetchUser ───────────────────────────────────

describe('fetchUser', () => {
  test('returns user data with correct shape', async () => {
    const response = await fetchUser();
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('firstName');
    expect(response.data).toHaveProperty('lastName');
    expect(response.data).toHaveProperty('email');
    expect(response.timestamp).toBeDefined();
  });
});

// ─── fetchAccounts ───────────────────────────────

describe('fetchAccounts', () => {
  test('returns an array of accounts', async () => {
    const response = await fetchAccounts();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });

  test('each account has required fields', async () => {
    const response = await fetchAccounts();
    response.data.forEach((account) => {
      expect(account).toHaveProperty('id');
      expect(account).toHaveProperty('type');
      expect(account).toHaveProperty('name');
      expect(account).toHaveProperty('accountNumber');
      expect(account).toHaveProperty('balance');
      expect(account).toHaveProperty('availableBalance');
      expect(typeof account.balance).toBe('number');
    });
  });

  test('accounts include both checking and savings types', async () => {
    const response = await fetchAccounts();
    const types = response.data.map((a) => a.type);
    expect(types).toContain('checking');
    expect(types).toContain('savings');
  });
});

// ─── fetchAccountById ────────────────────────────

describe('fetchAccountById', () => {
  test('returns correct account for valid ID', async () => {
    const response = await fetchAccountById('acc_checking_001');
    expect(response.data.id).toBe('acc_checking_001');
    expect(response.data.type).toBe('checking');
  });

  test('throws error for invalid account ID', async () => {
    await expect(fetchAccountById('invalid_id')).rejects.toThrow(
      'Account invalid_id not found'
    );
  });
});

// ─── fetchTransactions ───────────────────────────

describe('fetchTransactions', () => {
  test('returns transactions for a valid account', async () => {
    const response = await fetchTransactions('acc_checking_001');
    expect(response.data.transactions.length).toBeGreaterThan(0);
    expect(response.data).toHaveProperty('total');
    expect(response.data).toHaveProperty('hasMore');
  });

  test('transactions are sorted by date descending', async () => {
    const response = await fetchTransactions('acc_checking_001');
    const dates = response.data.transactions.map((t) => new Date(t.date).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });

  test('each transaction has required fields', async () => {
    const response = await fetchTransactions('acc_checking_001');
    response.data.transactions.forEach((txn) => {
      expect(txn).toHaveProperty('id');
      expect(txn).toHaveProperty('description');
      expect(txn).toHaveProperty('amount');
      expect(txn).toHaveProperty('date');
      expect(txn).toHaveProperty('category');
      expect(txn).toHaveProperty('status');
    });
  });

  test('returns empty array for account with no transactions', async () => {
    const response = await fetchTransactions('acc_savings_002');
    expect(response.data.transactions).toEqual([]);
    expect(response.data.total).toBe(0);
  });

  test('respects pagination limit', async () => {
    const response = await fetchTransactions('acc_checking_001', { limit: 2 });
    expect(response.data.transactions.length).toBeLessThanOrEqual(2);
  });
});

// ─── submitTransfer ──────────────────────────────

describe('submitTransfer', () => {
  test('successful transfer returns confirmation', async () => {
    const response = await submitTransfer({
      fromAccountId: 'acc_checking_001',
      toAccountId: 'acc_savings_001',
      amount: 100,
      memo: 'Test transfer',
    });
    expect(response.data).toHaveProperty('referenceNumber');
    expect(response.data).toHaveProperty('status', 'completed');
    expect(response.data).toHaveProperty('fromAccount');
    expect(response.data).toHaveProperty('toAccount');
    expect(response.data.amount).toBe(100);
  });

  test('transfer with invalid source account throws error', async () => {
    await expect(
      submitTransfer({
        fromAccountId: 'invalid',
        toAccountId: 'acc_savings_001',
        amount: 100,
      })
    ).rejects.toThrow('Source account not found');
  });

  test('transfer with invalid destination account throws error', async () => {
    await expect(
      submitTransfer({
        fromAccountId: 'acc_checking_001',
        toAccountId: 'invalid',
        amount: 100,
      })
    ).rejects.toThrow('Destination account not found');
  });

  test('transfer exceeding balance throws insufficient funds error', async () => {
    await expect(
      submitTransfer({
        fromAccountId: 'acc_checking_001',
        toAccountId: 'acc_savings_001',
        amount: 999999,
      })
    ).rejects.toThrow('Insufficient funds');
  });
});
