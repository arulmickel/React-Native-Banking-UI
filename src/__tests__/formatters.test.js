/**
 * Unit tests for formatting utilities.
 *
 * Tests cover:
 *   - Currency formatting (positive, negative, sign display, edge cases)
 *   - Date formatting (short, long, relative)
 *   - Account number masking
 *   - Transfer amount validation (happy path + edge cases)
 *   - Accessibility label generation
 */

import {
  formatCurrency,
  formatDate,
  maskAccountNumber,
  validateTransferAmount,
  getTransactionA11yLabel,
} from '../utils/formatters';

// ─── formatCurrency ──────────────────────────────

describe('formatCurrency', () => {
  test('formats positive amount correctly', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  test('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('formats negative amount with minus sign', () => {
    expect(formatCurrency(-87.43)).toBe('-$87.43');
  });

  test('formats large numbers with comma separators', () => {
    expect(formatCurrency(15432.18)).toBe('$15,432.18');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  test('shows + sign for positive when showSign is true', () => {
    expect(formatCurrency(50, true)).toBe('+$50.00');
  });

  test('shows - sign for negative when showSign is true', () => {
    expect(formatCurrency(-50, true)).toBe('-$50.00');
  });

  test('handles null/undefined gracefully', () => {
    expect(formatCurrency(null)).toBe('$0.00');
    expect(formatCurrency(undefined)).toBe('$0.00');
  });

  test('handles NaN gracefully', () => {
    expect(formatCurrency(NaN)).toBe('$0.00');
  });

  test('rounds to two decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
    expect(formatCurrency(10.001)).toBe('$10.00');
  });
});

// ─── formatDate ──────────────────────────────────

describe('formatDate', () => {
  test('formats short date correctly', () => {
    const result = formatDate('2026-01-15T12:00:00Z', 'short');
    expect(result).toBe('Jan 15');
  });

  test('formats long date correctly', () => {
    const result = formatDate('2026-01-15T12:00:00Z', 'long');
    expect(result).toBe('January 15, 2026');
  });

  test('returns empty string for null input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
  });

  test('returns empty string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  test('relative format shows "Today" for today', () => {
    const today = new Date().toISOString();
    expect(formatDate(today, 'relative')).toBe('Today');
  });

  test('relative format shows "Yesterday" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday.toISOString(), 'relative')).toBe('Yesterday');
  });
});

// ─── maskAccountNumber ───────────────────────────

describe('maskAccountNumber', () => {
  test('masks account number showing last 4 digits', () => {
    expect(maskAccountNumber('9283746501')).toBe('••••6501');
  });

  test('handles short account numbers', () => {
    expect(maskAccountNumber('123')).toBe('••••');
    expect(maskAccountNumber('')).toBe('••••');
  });

  test('handles null/undefined', () => {
    expect(maskAccountNumber(null)).toBe('••••');
    expect(maskAccountNumber(undefined)).toBe('••••');
  });

  test('handles exactly 4-digit number', () => {
    expect(maskAccountNumber('1234')).toBe('••••1234');
  });
});

// ─── validateTransferAmount ──────────────────────

describe('validateTransferAmount', () => {
  const MAX_BALANCE = 5000;

  test('valid amount returns success', () => {
    const result = validateTransferAmount('100', MAX_BALANCE);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.amount).toBe(100);
  });

  test('empty string returns error', () => {
    const result = validateTransferAmount('', MAX_BALANCE);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter an amount');
  });

  test('non-numeric input returns error', () => {
    const result = validateTransferAmount('abc', MAX_BALANCE);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
  });

  test('zero amount returns error', () => {
    const result = validateTransferAmount('0', MAX_BALANCE);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Amount must be greater than zero');
  });

  test('negative amount returns error', () => {
    const result = validateTransferAmount('-50', MAX_BALANCE);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Amount must be greater than zero');
  });

  test('amount exceeding balance returns insufficient funds error', () => {
    const result = validateTransferAmount('6000', MAX_BALANCE);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Insufficient funds');
    expect(result.error).toContain('$5,000.00');
  });

  test('amount equal to balance is valid', () => {
    const result = validateTransferAmount('5000', MAX_BALANCE);
    expect(result.valid).toBe(true);
  });

  test('handles amount with dollar sign and commas', () => {
    const result = validateTransferAmount('$1,500.50', MAX_BALANCE);
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(1500.50);
  });

  test('handles amount with spaces', () => {
    const result = validateTransferAmount(' 100 ', MAX_BALANCE);
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(100);
  });
});

// ─── getTransactionA11yLabel ─────────────────────

describe('getTransactionA11yLabel', () => {
  test('generates correct label for debit transaction', () => {
    const transaction = {
      description: 'Whole Foods',
      amount: -87.43,
      date: '2026-01-15T12:00:00Z',
      category: 'Groceries',
    };
    const label = getTransactionA11yLabel(transaction);
    expect(label).toContain('Whole Foods');
    expect(label).toContain('spent');
    expect(label).toContain('$87.43');
    expect(label).toContain('Groceries');
  });

  test('generates correct label for credit transaction', () => {
    const transaction = {
      description: 'Direct Deposit',
      amount: 3200,
      date: '2026-01-15T12:00:00Z',
      category: 'Income',
    };
    const label = getTransactionA11yLabel(transaction);
    expect(label).toContain('Direct Deposit');
    expect(label).toContain('received');
    expect(label).toContain('$3,200.00');
    expect(label).toContain('Income');
  });
});
