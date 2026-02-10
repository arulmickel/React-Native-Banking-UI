import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../utils/theme';
import { formatCurrency, maskAccountNumber } from '../utils/formatters';

/**
 * AccountCard — Reusable card component displaying account summary.
 *
 * Accessibility:
 *   - Entire card is a single accessible element (accessibilityRole="button")
 *   - accessibilityLabel provides full context for screen readers
 *   - Minimum 44dp touch target (WCAG 2.5.5)
 *   - High-contrast text on background (15.4:1 ratio)
 *
 * @param {Object} props
 * @param {Object} props.account - Account data object
 * @param {Function} props.onPress - Callback when card is tapped
 */
export default function AccountCard({ account, onPress }) {
  const { name, type, accountNumber, balance, availableBalance, apy } = account;
  const masked = maskAccountNumber(accountNumber);

  // Build a descriptive label for screen readers
  const a11yLabel = [
    `${name} account`,
    `ending in ${accountNumber.slice(-4)}`,
    `Balance: ${formatCurrency(balance)}`,
    availableBalance !== balance
      ? `Available: ${formatCurrency(availableBalance)}`
      : null,
    apy ? `Annual percentage yield: ${apy}%` : null,
    'Double tap to view transactions',
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(account)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      {/* Account type badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>
          {type === 'checking' ? '🏦 Checking' : '💰 Savings'}
        </Text>
      </View>

      {/* Account name & masked number */}
      <Text style={styles.accountName}>{name}</Text>
      <Text style={styles.accountNumber}>{masked}</Text>

      {/* Balance section */}
      <View style={styles.balanceContainer}>
        <View>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>
        {type === 'savings' && apy && (
          <View style={styles.apyBadge}>
            <Text style={styles.apyText}>{apy}% APY</Text>
          </View>
        )}
      </View>

      {/* Available balance (if different) */}
      {availableBalance !== balance && (
        <Text style={styles.availableText}>
          Available: {formatCurrency(availableBalance)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,

    // Elevation / shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  typeText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
  accountName: {
    fontSize: FONT_SIZE.bodyLarge,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  accountNumber: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  apyBadge: {
    backgroundColor: COLORS.primaryLight + '20', // 20% opacity
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  apyText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  availableText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
