import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { HttpError } from '@/api/httpError';
import { apiRequest } from '@/api/lumora/client';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme/tokens';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest('/forgot-password', {
        method: 'POST',
        body: { email: email.trim() },
      });
      setMessage('Te hemos enviado un enlace para restablecer la contraseña.');
    } catch (requestError) {
      setError(
        requestError instanceof HttpError
          ? requestError.message
          : 'No se ha podido enviar el enlace.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <AppText variant="title">Recuperar contraseña</AppText>
        <AppText muted>
          Introduce el email de tu cuenta y te enviaremos un enlace seguro.
        </AppText>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="tu@email.com"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        {message ? <AppText style={styles.success}>{message}</AppText> : null}
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
        <AppButton
          label="Enviar enlace"
          loading={busy}
          disabled={!email.trim()}
          onPress={() => void submit()}
        />
        <Link href="/login" replace>
          <AppText style={styles.link}>Volver a iniciar sesión</AppText>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  input: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
  },
  success: {
    color: colors.success,
  },
  error: {
    color: colors.favorite,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
  },
});
