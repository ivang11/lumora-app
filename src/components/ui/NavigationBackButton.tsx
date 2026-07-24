import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii } from '@/theme/tokens';

interface NavigationBackButtonProps {
  style?: StyleProp<ViewStyle>;
}

export function NavigationBackButton({ style }: NavigationBackButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Volver"
      hitSlop={8}
      onPress={goBack}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.pressed,
      ]}>
      <Ionicons name="arrow-back" size={21} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.96 }],
  },
});
