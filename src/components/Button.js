import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../utils/theme';

/**
 * Button — Reusable button with primary/secondary/outline variants.
 *
 * Accessibility:
 *   - accessibilityRole="button" for correct semantics
 *   - accessibilityState={{ disabled }} announces disabled state
 *   - Minimum 44dp height (WCAG 2.5.5)
 *   - Loading state announced via accessibilityLabel
 *
 * @param {Object} props
 * @param {string} props.title - Button label
 * @param {'primary'|'secondary'|'outline'} props.variant - Visual style
 * @param {boolean} props.loading - Show spinner instead of text
 * @param {boolean} props.disabled - Disable interaction
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[variant],
    isDisabled && styles.disabled,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={loading ? `${title}, loading` : accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.textOnPrimary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surfaceAlt,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabled: {
    backgroundColor: COLORS.disabledBg,
    borderColor: COLORS.disabledBg,
  },
  baseText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
  },
  primaryText: {
    color: COLORS.textOnPrimary,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.disabled,
  },
});
