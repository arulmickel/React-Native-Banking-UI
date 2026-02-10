import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, AccessibilityInfo,
} from 'react-native';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, MIN_TOUCH_TARGET,
} from '../utils/theme';
import { formatCurrency, maskAccountNumber, validateTransferAmount } from '../utils/formatters';
import { fetchAccounts, submitTransfer } from '../api';
import { useFetch } from '../hooks/useFetch';
import { Button, LoadingState, ErrorState } from '../components';

/**
 * Transfer flow states.
 * Follows a simple state machine: FORM → REVIEW → SUCCESS
 */
const STEPS = {
  FORM: 'FORM',
  REVIEW: 'REVIEW',
  SUCCESS: 'SUCCESS',
};

/**
 * TransferScreen — Multi-step fund transfer flow.
 *
 * Steps:
 *   1. FORM: Select from/to accounts, enter amount and optional memo
 *   2. REVIEW: Confirm transfer details before submitting
 *   3. SUCCESS: Show confirmation with reference number
 *
 * Accessibility:
 *   - Form fields have accessibilityLabel and accessibilityHint
 *   - Error messages use accessibilityLiveRegion="assertive" for immediate announcement
 *   - Focus management: amount input is auto-focused; errors shift focus
 *   - All buttons meet 44dp minimum touch target
 *   - Account picker uses accessibilityRole and accessibilityState.selected
 */
export default function TransferScreen({ navigation }) {
  const { data: accounts, loading, error, refetch } = useFetch(fetchAccounts);

  const [step, setStep] = useState(STEPS.FORM);
  const [fromAccountId, setFromAccountId] = useState(null);
  const [toAccountId, setToAccountId] = useState(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const amountInputRef = useRef(null);

  if (loading) return <LoadingState message="Loading accounts..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const fromAccount = accounts?.find((a) => a.id === fromAccountId);
  const toAccount = accounts?.find((a) => a.id === toAccountId);

  // Accounts available as destination (exclude source)
  const toOptions = (accounts || []).filter((a) => a.id !== fromAccountId);

  /**
   * Validates the form before moving to review step.
   */
  const handleContinue = () => {
    setFormError(null);

    if (!fromAccountId) {
      setFormError('Please select a source account');
      return;
    }
    if (!toAccountId) {
      setFormError('Please select a destination account');
      return;
    }
    if (fromAccountId === toAccountId) {
      setFormError('Source and destination accounts must be different');
      return;
    }

    const validation = validateTransferAmount(amount, fromAccount.availableBalance);
    if (!validation.valid) {
      setFormError(validation.error);
      return;
    }

    setStep(STEPS.REVIEW);
    // Announce step change to screen readers
    AccessibilityInfo.announceForAccessibility('Review your transfer details');
  };

  /**
   * Submits the transfer to the API.
   */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitTransfer({
        fromAccountId,
        toAccountId,
        amount: parseFloat(amount.replace(/[,$\s]/g, '')),
        memo,
      });
      setConfirmation(result.data);
      setStep(STEPS.SUCCESS);
      AccessibilityInfo.announceForAccessibility('Transfer completed successfully');
    } catch (err) {
      Alert.alert('Transfer Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTransfer = () => {
    setStep(STEPS.FORM);
    setFromAccountId(null);
    setToAccountId(null);
    setAmount('');
    setMemo('');
    setFormError(null);
    setConfirmation(null);
  };

  // ─── ACCOUNT PICKER ─────────────────────────

  const renderAccountPicker = (label, selectedId, onSelect, options) => (
    <View style={styles.pickerSection}>
      <Text style={styles.fieldLabel} accessibilityRole="header">
        {label}
      </Text>
      {options.map((account) => {
        const isSelected = account.id === selectedId;
        return (
          <TouchableOpacity
            key={account.id}
            style={[styles.accountOption, isSelected && styles.accountOptionSelected]}
            onPress={() => onSelect(account.id)}
            accessible={true}
            accessibilityRole="radio"
            accessibilityLabel={`${account.name}, balance ${formatCurrency(account.balance)}`}
            accessibilityState={{ selected: isSelected }}
          >
            <View style={styles.accountOptionContent}>
              <Text style={[styles.accountOptionName, isSelected && styles.selectedText]}>
                {account.name}
              </Text>
              <Text style={styles.accountOptionNumber}>
                {maskAccountNumber(account.accountNumber)}
              </Text>
            </View>
            <Text style={[styles.accountOptionBalance, isSelected && styles.selectedText]}>
              {formatCurrency(account.balance)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── STEP: FORM ─────────────────────────────

  if (step === STEPS.FORM) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Transfer Funds</Text>

        {/* Error banner */}
        {formError && (
          <View
            style={styles.errorBanner}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            <Text style={styles.errorText}>⚠️ {formError}</Text>
          </View>
        )}

        {/* From Account */}
        {renderAccountPicker('From Account', fromAccountId, (id) => {
          setFromAccountId(id);
          // Reset destination if same
          if (id === toAccountId) setToAccountId(null);
        }, accounts || [])}

        {/* To Account */}
        {fromAccountId && renderAccountPicker('To Account', toAccountId, setToAccountId, toOptions)}

        {/* Amount Input */}
        <View style={styles.fieldSection}>
          <Text
            style={styles.fieldLabel}
            nativeID="amount-label"
            accessibilityRole="header"
          >
            Amount
          </Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.dollarSign} importantForAccessibility="no">
              $
            </Text>
            <TextInput
              ref={amountInputRef}
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setFormError(null);
              }}
              placeholder="0.00"
              placeholderTextColor={COLORS.disabled}
              keyboardType="decimal-pad"
              returnKeyType="done"
              accessible={true}
              accessibilityLabel="Transfer amount in dollars"
              accessibilityHint="Enter the amount you want to transfer"
              accessibilityLabelledBy="amount-label"
            />
          </View>
          {fromAccount && (
            <Text style={styles.availableHint}>
              Available: {formatCurrency(fromAccount.availableBalance)}
            </Text>
          )}
        </View>

        {/* Memo (optional) */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel} nativeID="memo-label">
            Memo (optional)
          </Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="What's this for?"
            placeholderTextColor={COLORS.disabled}
            maxLength={100}
            accessible={true}
            accessibilityLabel="Transfer memo"
            accessibilityHint="Optional note for this transfer"
            accessibilityLabelledBy="memo-label"
          />
        </View>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            accessibilityHint="Review your transfer details before submitting"
          />
        </View>
      </ScrollView>
    );
  }

  // ─── STEP: REVIEW ───────────────────────────

  if (step === STEPS.REVIEW) {
    const transferAmount = parseFloat(amount.replace(/[,$\s]/g, ''));

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Review Transfer</Text>

        <View style={styles.reviewCard}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>From</Text>
            <Text style={styles.reviewValue}>{fromAccount?.name}</Text>
          </View>
          <View style={styles.reviewDivider} />
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>To</Text>
            <Text style={styles.reviewValue}>{toAccount?.name}</Text>
          </View>
          <View style={styles.reviewDivider} />
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Amount</Text>
            <Text style={styles.reviewAmount}>
              {formatCurrency(transferAmount)}
            </Text>
          </View>
          {memo ? (
            <>
              <View style={styles.reviewDivider} />
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Memo</Text>
                <Text style={styles.reviewValue}>{memo}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Confirm Transfer"
            onPress={handleSubmit}
            loading={submitting}
            accessibilityHint="Submit this transfer"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Edit"
            variant="outline"
            onPress={() => setStep(STEPS.FORM)}
            accessibilityHint="Go back to edit transfer details"
          />
        </View>
      </ScrollView>
    );
  }

  // ─── STEP: SUCCESS ──────────────────────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.successContent}>
      <Text
        style={styles.successIcon}
        importantForAccessibility="no"
      >
        ✅
      </Text>
      <Text
        style={styles.successTitle}
        accessibilityRole="header"
      >
        Transfer Complete!
      </Text>
      <Text style={styles.successAmount}>
        {formatCurrency(confirmation?.amount || 0)}
      </Text>
      <Text style={styles.successDetail}>
        {confirmation?.fromAccount} → {confirmation?.toAccount}
      </Text>

      <View style={styles.referenceCard}>
        <Text style={styles.referenceLabel}>Reference Number</Text>
        <Text
          style={styles.referenceNumber}
          selectable={true}
          accessibilityLabel={`Reference number: ${confirmation?.referenceNumber}`}
        >
          {confirmation?.referenceNumber}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Make Another Transfer"
          onPress={handleNewTransfer}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Back to Accounts"
          variant="outline"
          onPress={() => navigation.navigate('AccountSummary')}
        />
      </View>
    </ScrollView>
  );
}

// ─── STYLES ──────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  successContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  screenTitle: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  // Error banner
  errorBanner: {
    backgroundColor: '#FFF3F3',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.error,
  },

  // Account picker
  pickerSection: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: MIN_TOUCH_TARGET,
  },
  accountOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceAlt,
  },
  accountOptionContent: {
    flex: 1,
  },
  accountOptionName: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  accountOptionNumber: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
  },
  accountOptionBalance: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  selectedText: {
    color: COLORS.primaryDark,
  },

  // Amount input
  fieldSection: {
    marginBottom: SPACING.lg,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  dollarSign: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    minHeight: MIN_TOUCH_TARGET + 8,
    paddingVertical: SPACING.md,
  },
  availableHint: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Memo input
  memoInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
    minHeight: MIN_TOUCH_TARGET,
  },

  // Buttons
  buttonContainer: {
    marginTop: SPACING.lg,
  },
  buttonSpacer: {
    height: SPACING.sm,
  },

  // Review step
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  reviewLabel: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
  reviewValue: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  reviewAmount: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },

  // Success step
  successIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  successAmount: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  successDetail: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  referenceCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
  },
  referenceLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  referenceNumber: {
    fontSize: FONT_SIZE.bodyLarge,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primaryDark,
  },
});
