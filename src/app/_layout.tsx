import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { NavigationBackButton } from '@/components/ui/NavigationBackButton';
import { AppProviders } from '@/providers/AppProviders';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) {
      void SplashScreen.hideAsync();
    }
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <AppProviders>
      <StatusBar style="light" />
      <NetworkBanner />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión', presentation: 'modal' }} />
        <Stack.Screen name="register" options={{ title: 'Crear cuenta', presentation: 'modal' }} />
        <Stack.Screen
          name="forgot-password"
          options={{ title: 'Recuperar contraseña', presentation: 'modal' }}
        />
        <Stack.Screen name="password-reset/[token]" options={{ title: 'Nueva contraseña' }} />
        <Stack.Screen name="verify-email/[id]/[hash]" options={{ title: 'Verificar correo' }} />
        <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tv/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="person/[id]" options={{ title: 'Persona' }} />
        <Stack.Screen name="following" options={{ title: 'Próximos episodios' }} />
        <Stack.Screen name="category/[mediaType]/[name]" options={{ title: '' }} />
        <Stack.Screen name="genre/[mediaType]/[id]" options={{ title: '' }} />
      </Stack>
    </AppProviders>
  );
}
