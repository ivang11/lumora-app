import { Text, type TextProps, StyleSheet } from 'react-native';

import { colors } from '@/theme/tokens';

type TextVariant = 'body' | 'caption' | 'label' | 'title' | 'heading';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  muted?: boolean;
}

export function AppText({
  variant = 'body',
  muted = false,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        muted && styles.muted,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontSize: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heading: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  muted: {
    color: colors.textSecondary,
  },
});
