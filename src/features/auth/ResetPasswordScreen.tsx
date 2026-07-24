import { useRouter } from 'expo-router';
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

interface ResetPasswordScreenProps {
  token: string;
  initialEmail: string;
}

export function ResetPasswordScreen({
  token,
  initialEmail,
}: ResetPasswordScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await apiRequest('/reset-password', {
        method: 'POST',
        body: {
          token,
          email: email.trim(),
          password,
          password_confirmation: confirmation,
        },
      });
      router.replace('/login');
    } catch (requestError) {
      setError(
        requestError instanceof HttpError
          ? requestError.message
          : 'No se ha podido restablecer la contraseña.',
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
        <AppText variant="title">Nueva contraseña</AppText>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          accessibilityLabel="Nueva contraseña"
          autoComplete="new-password"
          placeholder="Nueva contraseña"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          accessibilityLabel="Confirmar nueva contraseña"
          autoComplete="new-password"
          placeholder="Confirmar contraseña"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={confirmation}
          onChangeText={setConfirmation}
        />
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
        <AppButton
          label="Guardar contraseña"
          loading={busy}
          disabled={!email || !password || password !== confirmation}
          onPress={() => void submit()}
        />
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
    gap: spacing.md,
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
  error: {
    color: colors.favorite,
  },
});
