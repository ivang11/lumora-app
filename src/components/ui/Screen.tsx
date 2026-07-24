import { type PropsWithChildren } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/theme/tokens';

interface ScreenProps extends PropsWithChildren {
  edges?: Edge[];
  style?: ViewStyle;
}

export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
