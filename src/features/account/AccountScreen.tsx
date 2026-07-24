import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { HttpError } from '@/api/httpError';
import { apiRequest } from '@/api/lumora/client';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthForm } from '@/features/auth/AuthForm';
import { useAuthStore } from '@/stores/authStore';
import { colors, radii, spacing } from '@/theme/tokens';

interface UserStats {
  movies: number;
  shows: number;
  episodes: number;
}

export function AccountScreen() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const forgetSession = useAuthStore((state) => state.forgetSession);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const stats = useQuery({
    queryKey: ['lumora', 'user', 'stats'],
    queryFn: () => apiRequest<UserStats>('/user/stats', { token }),
    enabled: Boolean(token),
  });

  if (!user || !token) {
    return <AuthForm mode="login" stayOnSuccess />;
  }

  const clearPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
  };

  const save = async () => {
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      await apiRequest('/user', {
        method: 'PUT',
        token,
        body: {
          name: name.trim(),
          email: email.trim(),
          ...(newPassword
            ? {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmation,
              }
            : {}),
        },
      });
      await refreshUser();
      clearPasswordFields();
      setEditing(false);
      setFeedback('Perfil actualizado correctamente.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se ha podido actualizar el perfil.'));
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    setBusy(true);
    setError('');
    try {
      await apiRequest('/email/verification-notification', {
        method: 'POST',
        token,
      });
      setFeedback('Te hemos enviado un nuevo email de verificación.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se ha podido enviar el email.'));
    } finally {
      setBusy(false);
    }
  };

  const removeAccount = async () => {
    setBusy(true);
    setError('');
    try {
      await apiRequest('/user', {
        method: 'DELETE',
        token,
        body: { current_password: deletePassword },
      });
      await forgetSession();
      queryClient.clear();
      setDeleteOpen(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se ha podido eliminar la cuenta.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <AppText variant="title">Mi Cuenta</AppText>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={42} color={colors.textSecondary} />
        </View>
        <AppText variant="heading">{user.name}</AppText>
        <AppText muted>{user.email}</AppText>
      </View>

      <View style={styles.stats}>
        <Stat value={stats.data?.movies ?? 0} label="Películas" />
        <View style={styles.statDivider} />
        <Stat value={stats.data?.episodes ?? 0} label="Episodios" highlighted />
        <View style={styles.statDivider} />
        <Stat value={stats.data?.shows ?? 0} label="Series" />
      </View>

      {!user.email_verified_at ? (
        <View style={styles.notice}>
          <AppText variant="label">Verifica tu correo</AppText>
          <AppText variant="caption" muted>
            Necesitas verificarlo para completar la seguridad de tu cuenta.
          </AppText>
          <AppButton
            label="Reenviar verificación"
            variant="secondary"
            loading={busy}
            onPress={() => void resendVerification()}
          />
        </View>
      ) : null}

      <View style={styles.card}>
        <SectionHeader
          icon="person"
          title="Información Personal"
          subtitle="Actualiza tu perfil"
          tone="primary"
        />
        <View style={styles.cardBody}>
          <Field
            label="Nombre"
            value={name}
            onChangeText={setName}
            editable={editing}
            autoCapitalize="words"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            editable={editing}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {editing ? (
            <>
              <View style={styles.passwordSection}>
                <AppText variant="label">Cambiar Contraseña</AppText>
              </View>
              <Field
                label="Contraseña actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <Field
                label="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Field
                label="Confirmar contraseña"
                value={confirmation}
                onChangeText={setConfirmation}
                secureTextEntry
              />
              <View style={styles.actions}>
                <AppButton
                  label="Cancelar"
                  variant="secondary"
                  style={styles.action}
                  onPress={() => {
                    setEditing(false);
                    setName(user.name);
                    setEmail(user.email);
                    clearPasswordFields();
                  }}
                />
                <AppButton
                  label="Guardar"
                  loading={busy}
                  disabled={
                    !name.trim() ||
                    !email.trim() ||
                    Boolean(newPassword && (!currentPassword || newPassword !== confirmation))
                  }
                  style={styles.action}
                  onPress={() => void save()}
                />
              </View>
            </>
          ) : (
            <AppButton label="Editar Perfil" onPress={() => setEditing(true)} />
          )}
        </View>
      </View>

      {feedback ? <AppText style={styles.success}>{feedback}</AppText> : null}
      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        onPress={() => {
          queryClient.clear();
          void logout();
        }}>
        <View style={[styles.iconBox, styles.iconBoxDanger]}>
          <Ionicons name="log-out-outline" size={24} color={styles.dangerText.color} />
        </View>
        <View style={styles.logoutCopy}>
          <AppText variant="label" style={styles.dangerText}>
            Cerrar sesión
          </AppText>
          <AppText variant="caption" muted>
            Salir de esta cuenta
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <View style={styles.danger}>
        <SectionHeader
          icon="warning"
          title="Zona Peligrosa"
          subtitle="Acciones irreversibles"
          tone="danger"
        />
        <View style={styles.cardBody}>
          <AppText muted style={styles.dangerDescription}>
            Una vez eliminada la cuenta, todos los datos se borrarán permanentemente.
          </AppText>
          <AppButton
            label="Eliminar Cuenta"
            variant="danger"
            onPress={() => {
              setError('');
              setDeleteOpen(true);
            }}
          />
        </View>
      </View>

      <DeleteAccountModal
        visible={deleteOpen}
        password={deletePassword}
        busy={busy}
        onChangePassword={setDeletePassword}
        onCancel={() => {
          setDeleteOpen(false);
          setDeletePassword('');
        }}
        onConfirm={() => void removeAccount()}
      />
    </ScrollView>
  );
}

function Stat({
  value,
  label,
  highlighted = false,
}: {
  value: number;
  label: string;
  highlighted?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <AppText style={[styles.statValue, highlighted && styles.statValueHighlighted]}>
        {value}
      </AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  tone,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  tone: 'primary' | 'danger';
}) {
  const danger = tone === 'danger';

  return (
    <View style={[styles.sectionHeader, danger && styles.sectionHeaderDanger]}>
      <View style={[styles.iconBox, danger ? styles.iconBoxDanger : styles.iconBoxPrimary]}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? styles.dangerText.color : colors.primary}
        />
      </View>
      <View>
        <AppText variant="label" style={danger && styles.dangerText}>
          {title}
        </AppText>
        <AppText variant="caption" muted>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}

function Field({ label, editable = true, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        editable={editable}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, !editable && styles.inputDisabled]}
        {...props}
      />
    </View>
  );
}

function DeleteAccountModal({
  visible,
  password,
  busy,
  onChangePassword,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  password: string;
  busy: boolean;
  onChangePassword: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modal}>
          <AppText variant="heading">¿Eliminar la cuenta?</AppText>
          <AppText muted>
            Esta acción no se puede deshacer. Confirma tu contraseña actual.
          </AppText>
          <TextInput
            accessibilityLabel="Contraseña actual para eliminar la cuenta"
            placeholder="Contraseña actual"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={onChangePassword}
          />
          <View style={styles.actions}>
            <AppButton
              label="Cancelar"
              variant="secondary"
              style={styles.action}
              onPress={onCancel}
            />
            <AppButton
              label="Eliminar"
              variant="danger"
              loading={busy}
              disabled={!password}
              style={styles.action}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof HttpError)) return fallback;
  const firstValidationError = Object.values(error.errors ?? {}).flat()[0];
  return firstValidationError ?? error.message;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  profile: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statValueHighlighted: {
    color: colors.primary,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  notice: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionHeaderDanger: {
    borderBottomColor: 'rgba(224, 80, 80, 0.22)',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxPrimary: {
    backgroundColor: 'rgba(0, 212, 200, 0.17)',
  },
  iconBoxDanger: {
    backgroundColor: 'rgba(224, 80, 80, 0.18)',
  },
  cardBody: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.62,
  },
  passwordSection: {
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
  success: {
    color: colors.success,
  },
  error: {
    color: colors.favorite,
  },
  danger: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(224, 80, 80, 0.28)',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dangerText: {
    color: '#ff7d7d',
  },
  dangerDescription: {
    lineHeight: 24,
  },
  logout: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  logoutCopy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.72,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
});
