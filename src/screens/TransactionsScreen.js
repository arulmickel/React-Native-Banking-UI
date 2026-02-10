import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../utils/theme';
import { formatCurrency, maskAccountNumber } from '../utils/formatters';
import { fetchAccountById, fetchTransactions } from '../api';
import { useFetch } from '../hooks/useFetch';
import { TransactionItem, LoadingState, ErrorState } from '../components';

/**
 * Filter chips for transaction categories.
 */
const FILTER_OPTIONS = ['All', 'Income', 'Groceries', 'Entertainment', 'Transfer', 'Shopping'];

/**
 * TransactionsScreen — Displays transaction history for a selected account.
 *
 * Features:
 *   - Account balance header with masked account number
 *   - Category filter chips (horizontally scrollable)
 *   - Filtered transaction list with empty state
 *
 * Accessibility:
 *   - Filter chips use accessibilityRole="tab" with accessibilityState.selected
 *   - Transaction list items have descriptive labels
 *   - Empty state clearly announced
 */
export default function TransactionsScreen({ route }) {
  const { accountId, accountName } = route.params;
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: account, loading: accountLoading } = useFetch(
    () => fetchAccountById(accountId),
    [accountId]
  );

  const {
    data: transactionData,
    loading: txLoading,
    error: txError,
    refetch,
  } = useFetch(
    () => fetchTransactions(accountId),
    [accountId]
  );

  const loading = accountLoading || txLoading;
  const transactions = transactionData?.transactions || [];

  // Filter transactions by category
  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'All') return transactions;
    return transactions.filter((t) => t.category === activeFilter);
  }, [transactions, activeFilter]);

  if (loading) return <LoadingState message="Loading transactions..." />;
  if (txError) return <ErrorState message={txError} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Account balance header */}
            {account && (
              <View
                style={styles.balanceHeader}
                accessible={true}
                accessibilityLabel={`${accountName}, account ending in ${account.accountNumber.slice(-4)}, balance ${formatCurrency(account.balance)}`}
              >
                <Text style={styles.accountTitle}>{accountName}</Text>
                <Text style={styles.accountNumber}>
                  {maskAccountNumber(account.accountNumber)}
                </Text>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(account.balance)}
                </Text>
                <Text style={styles.balanceLabel}>Available Balance</Text>
              </View>
            )}

            {/* Filter chips */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Transactions</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={FILTER_OPTIONS}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.filterChips}
                renderItem={({ item }) => {
                  const isActive = item === activeFilter;
                  return (
                    <TouchableOpacity
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setActiveFilter(item)}
                      accessible={true}
                      accessibilityRole="tab"
                      accessibilityLabel={`Filter by ${item}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        ListEmptyComponent={
          <View
            style={styles.emptyContainer}
            accessible={true}
            accessibilityLabel={`No ${activeFilter === 'All' ? '' : activeFilter + ' '}transactions found`}
          >
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No {activeFilter === 'All' ? '' : `${activeFilter} `}transactions
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  balanceHeader: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  accountTitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textOnPrimary,
    opacity: 0.85,
    marginBottom: SPACING.xs,
  },
  accountNumber: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textOnPrimary,
    opacity: 0.7,
    marginBottom: SPACING.md,
  },
  balanceAmount: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.xs,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textOnPrimary,
    opacity: 0.7,
  },
  filterContainer: {
    padding: SPACING.md,
    paddingBottom: 0,
  },
  filterTitle: {
    fontSize: FONT_SIZE.bodyLarge,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  filterChips: {
    paddingBottom: SPACING.sm,
  },
  chip: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textOnPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
});
