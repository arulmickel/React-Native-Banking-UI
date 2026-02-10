import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../utils/theme';

/**
 * LoadingState — Full-screen centered loading indicator.
 *
 * Accessibility:
 *   - accessibilityLabel announces loading to screen readers
 *   - Uses accessibilityRole="progressbar" for correct semantics
 */
export default function LoadingState({ message = 'Loading...' }) {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.message}>{message}</Text>
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
  message: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
});
