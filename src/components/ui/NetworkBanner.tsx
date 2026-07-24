import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/theme/tokens';

export function NetworkBanner() {
  const network = useNetInfo();

  if (network.isConnected !== false) return null;

  return (
    <View accessibilityRole="alert" style={styles.banner}>
      <AppText variant="caption" style={styles.text}>
        Sin conexión. Mostramos los datos guardados y reintentaremos al volver la red.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: {
    color: colors.black,
    fontWeight: '700',
    textAlign: 'center',
  },
});
