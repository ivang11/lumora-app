import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { HttpError } from '@/api/httpError';
import { apiRequest } from '@/api/lumora/client';
import { AppText } from '@/components/ui/AppText';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing } from '@/theme/tokens';

interface VerifyEmailScreenProps {
  id: string;
  hash: string;
  expires?: string;
  signature?: string;
}

export function VerifyEmailScreen({
  id,
  hash,
  expires,
  signature,
}: VerifyEmailScreenProps) {
  const token = useAuthStore((state) => state.token);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [message, setMessage] = useState(
    token ? 'Verificando tu correo…' : 'Inicia sesión antes de verificar el correo.',
  );

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      const query = new URLSearchParams();
      if (expires) query.set('expires', expires);
      if (signature) query.set('signature', signature);

      try {
        await apiRequest(`/verify-email/${id}/${hash}?${query.toString()}`, {
          token,
        });
        await refreshUser();
        setStatus('success');
        setMessage('Tu correo ha sido verificado correctamente.');
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof HttpError
            ? error.message
            : 'El enlace no es válido o ha caducado.',
        );
      }
    };

    void verify();
  }, [expires, hash, id, refreshUser, signature, token]);

  return (
    <View style={styles.container}>
      {status === 'loading' ? <ActivityIndicator color={colors.primary} /> : null}
      <AppText variant="heading">
        {status === 'success' ? 'Correo verificado' : 'Verificación de correo'}
      </AppText>
      <AppText muted style={styles.message}>
        {message}
      </AppText>
      <Link href={token ? '/(tabs)/account' : '/login'} replace>
        <AppText style={styles.link}>
          {token ? 'Ir a mi cuenta' : 'Iniciar sesión'}
        </AppText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  message: {
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
  },
});
