import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../utils/theme';

/**
 * ErrorState — Displays an error message with optional retry button.
 *
 * Accessibility:
 *   - Error message announced via accessibilityRole="alert"
 *   - Retry button meets minimum 44dp touch target
 *   - accessibilityHint tells user what retry does
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon} importantForAccessibility="no">
        ⚠️
      </Text>
      <Text
        style={styles.message}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        {message || 'Something went wrong. Please try again.'}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityHint="Attempts to reload the data"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
