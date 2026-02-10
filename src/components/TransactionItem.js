import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../utils/theme';
import { formatCurrency, formatDate, getTransactionA11yLabel } from '../utils/formatters';

/**
 * Category icons mapping.
 * Using emoji for demo; in production, use an icon library like lucide-react-native.
 */
const CATEGORY_ICONS = {
  Groceries: '🛒',
  Income: '💵',
  Entertainment: '🎬',
  Transportation: '🚗',
  Transfer: '🔄',
  'Food & Drink': '☕',
  Shopping: '🛍️',
  Interest: '📈',
};

/**
 * TransactionItem — Displays a single transaction row.
 *
 * Accessibility:
 *   - accessibilityLabel announces: description, amount, date, category
 *   - Color is NEVER the only indicator (icon + sign + label all convey direction)
 *   - Text meets 4.5:1 contrast ratio on white background
 */
export default function TransactionItem({ transaction }) {
  const { description, amount, date, category } = transaction;
  const isCredit = amount >= 0;
  const icon = CATEGORY_ICONS[category] || '📋';

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={getTransactionA11yLabel(transaction)}
    >
      {/* Category icon */}
      <View
        style={styles.iconContainer}
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Description & date */}
      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.dateText}>
          {formatDate(date, 'relative')} · {category}
        </Text>
      </View>

      {/* Amount — color + sign both indicate direction (no color-only reliance) */}
      <Text
        style={[styles.amount, isCredit ? styles.credit : styles.debit]}
        importantForAccessibility="no"
      >
        {formatCurrency(amount, true)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 18,
  },
  details: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
  },
  credit: {
    color: COLORS.success, // 4.8:1 on white
  },
  debit: {
    color: COLORS.textPrimary, // 15.4:1 on white — NOT red-only
  },
});
