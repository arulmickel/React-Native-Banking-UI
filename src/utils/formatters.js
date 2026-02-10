/**
 * Formatting utilities for currency, dates, and account masking.
 * All functions are pure (no side effects) and easily unit-testable.
 */

/**
 * Formats a number as USD currency string.
 * @param {number} amount - The dollar amount
 * @param {boolean} showSign - Whether to show +/- prefix
 * @returns {string} Formatted string e.g. "$1,234.56" or "+$50.00"
 *
 * @example
 * formatCurrency(1234.5)        // "$1,234.50"
 * formatCurrency(-50, true)     // "-$50.00"
 * formatCurrency(50, true)      // "+$50.00"
 */
export function formatCurrency(amount, showSign = false) {
  if (amount == null || isNaN(amount)) return '$0.00';

  const absFormatted = Math.abs(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (showSign) {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${absFormatted}`;
  }

  return amount < 0 ? `-$${absFormatted}` : `$${absFormatted}`;
}

/**
 * Formats an ISO date string into readable format.
 * @param {string} isoDate - ISO 8601 date string
 * @param {string} format - 'short' (Jan 15) | 'long' (January 15, 2025) | 'relative' (Today, Yesterday)
 * @returns {string} Formatted date
 */
export function formatDate(isoDate, format = 'short') {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - target) / (1000 * 60 * 60 * 24));

  if (format === 'relative') {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const shortMonths = months.map((m) => m.substring(0, 3));

  if (format === 'long') {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  // short format
  return `${shortMonths[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Masks an account number showing only last 4 digits.
 * @param {string} accountNumber - Full account number
 * @returns {string} Masked string e.g. "••••4567"
 */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber.length < 4) return '••••';
  const last4 = accountNumber.slice(-4);
  return `••••${last4}`;
}

/**
 * Returns a human-readable accessibility label for a transaction.
 * Ensures screen readers announce transaction details clearly.
 *
 * @param {Object} transaction - Transaction object
 * @returns {string} Accessibility label
 */
export function getTransactionA11yLabel(transaction) {
  const { description, amount, date, category } = transaction;
  const amountText = amount >= 0
    ? `received ${formatCurrency(amount)}`
    : `spent ${formatCurrency(Math.abs(amount))}`;
  const dateText = formatDate(date, 'long');
  return `${description}, ${amountText}, on ${dateText}, category ${category}`;
}

/**
 * Validates a transfer amount.
 * @param {string} input - User-entered amount string
 * @param {number} maxBalance - Maximum available balance
 * @returns {{ valid: boolean, error: string | null, amount: number }}
 */
export function validateTransferAmount(input, maxBalance) {
  if (!input || input.trim() === '') {
    return { valid: false, error: 'Please enter an amount', amount: 0 };
  }

  const cleaned = input.replace(/[,$\s]/g, '');
  const amount = parseFloat(cleaned);

  if (isNaN(amount)) {
    return { valid: false, error: 'Please enter a valid number', amount: 0 };
  }
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero', amount: 0 };
  }
  if (amount > maxBalance) {
    return {
      valid: false,
      error: `Insufficient funds. Available balance: ${formatCurrency(maxBalance)}`,
      amount,
    };
  }

  return { valid: true, error: null, amount };
}
