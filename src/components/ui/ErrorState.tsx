import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme/tokens';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Algo no ha ido bien',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="heading">{title}</AppText>
      <AppText muted style={styles.message}>
        {message}
      </AppText>
      {onRetry ? <AppButton label="Reintentar" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  message: {
    textAlign: 'center',
  },
});
