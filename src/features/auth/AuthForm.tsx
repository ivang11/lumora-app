import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { HttpError } from '@/api/httpError';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { useAuthStore } from '@/stores/authStore';
import { colors, radii, spacing } from '@/theme/tokens';

interface AuthFormProps {
  mode: 'login' | 'register';
  stayOnSuccess?: boolean;
}

export function AuthForm({ mode, stayOnSuccess = false }: AuthFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const busy = useAuthStore((state) => state.busy);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  const submit = async () => {
    setError('');
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password, confirmation);
      } else {
        await login(email.trim(), password);
      }
      if (!stayOnSuccess) {
        router.dismissAll();
        router.replace('/(tabs)');
      }
    } catch (submitError) {
      setError(
        submitError instanceof HttpError
          ? submitError.message
          : 'No se ha podido completar el acceso.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <AppText variant="title">{isRegister ? 'Crear cuenta' : 'Bienvenido de vuelta'}</AppText>
          <AppText muted>
            {isRegister ? 'Empieza a explorar el cine' : 'Accede a tu colección de Lumora'}
          </AppText>
        </View>

        <View style={styles.form}>
          {isRegister ? (
            <TextInput
              accessibilityLabel="Nombre"
              autoCapitalize="words"
              placeholder="Tu nombre"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          ) : null}
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
          <TextInput
            accessibilityLabel="Contraseña"
            autoCapitalize="none"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder="Contraseña"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          {isRegister ? (
            <TextInput
              accessibilityLabel="Confirmar contraseña"
              autoCapitalize="none"
              autoComplete="new-password"
              placeholder="Confirmar contraseña"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={confirmation}
              onChangeText={setConfirmation}
            />
          ) : null}
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          {!isRegister ? (
            <Link href="/forgot-password">
              <AppText style={styles.forgot}>¿Has olvidado la contraseña?</AppText>
            </Link>
          ) : null}
          <AppButton
            label={isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            loading={busy}
            onPress={() => void submit()}
          />
          <AppButton
            label={isRegister ? 'Ya tengo cuenta' : 'Crear una cuenta'}
            variant="secondary"
            onPress={() => router.replace(isRegister ? '/login' : '/register')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  heading: {
    gap: spacing.sm,
  },
  form: {
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
  forgot: {
    color: colors.primary,
    textAlign: 'right',
  },
});
