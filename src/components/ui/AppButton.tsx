import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme/tokens';

interface AppButtonProps extends PressableProps {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function AppButton({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        styles[variant],
        state.pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.black : colors.white} />
      ) : (
        <AppText
          variant="label"
          style={variant === 'primary' ? styles.primaryText : styles.defaultText}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.favorite,
    borderColor: colors.favorite,
  },
  primaryText: {
    color: colors.black,
  },
  defaultText: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
