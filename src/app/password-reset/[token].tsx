import { useLocalSearchParams } from 'expo-router';

import { ResetPasswordScreen } from '@/features/auth/ResetPasswordScreen';

export default function PasswordResetRoute() {
  const { token, email } = useLocalSearchParams<{
    token: string;
    email?: string;
  }>();
  return <ResetPasswordScreen token={token} initialEmail={email ?? ''} />;
}
