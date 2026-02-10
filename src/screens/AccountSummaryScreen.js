import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../utils/theme';
import { formatCurrency } from '../utils/formatters';
import { fetchAccounts } from '../api';
import { useFetch } from '../hooks/useFetch';
import { AccountCard, LoadingState, ErrorState } from '../components';

/**
 * AccountSummaryScreen — Main dashboard showing all user accounts.
 *
 * Features:
 *   - Total balance aggregation across all accounts
 *   - Tappable account cards navigate to transaction detail
 *   - Pull-to-refresh support
 *   - Loading, error, and empty states
 *
 * Accessibility:
 *   - Screen title announced via header
 *   - Total balance uses accessibilityLabel for clear announcement
 *   - FlatList items are individually focusable
 */
export default function AccountSummaryScreen({ navigation }) {
  const { data: accounts, loading, error, refetch } = useFetch(fetchAccounts);

  if (loading) return <LoadingState message="Loading your accounts..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // Compute total balance across all accounts
  const totalBalance = (accounts || []).reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const handleAccountPress = (account) => {
    navigation.navigate('Transactions', {
      accountId: account.id,
      accountName: account.name,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Greeting */}
            <Text style={styles.greeting}>Good morning 👋</Text>

            {/* Total Balance Card */}
            <View
              style={styles.totalCard}
              accessible={true}
              accessibilityLabel={`Total balance across all accounts: ${formatCurrency(totalBalance)}`}
            >
              <Text style={styles.totalLabel}>Total Balance</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(totalBalance)}
              </Text>
              <Text style={styles.totalSubtext}>
                Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Section title */}
            <Text style={styles.sectionTitle}>Your Accounts</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AccountCard account={item} onPress={handleAccountPress} />
        )}
        refreshing={loading}
        onRefresh={refetch}
        // Accessibility: announce list context
        accessibilityLabel={`${accounts.length} accounts`}
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
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  totalLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textOnPrimary,
    opacity: 0.85,
    marginBottom: SPACING.xs,
  },
  totalAmount: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.xs,
  },
  totalSubtext: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textOnPrimary,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.bodyLarge,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
});
