import { useLocalSearchParams } from 'expo-router';

import { VerifyEmailScreen } from '@/features/auth/VerifyEmailScreen';

export default function VerifyEmailRoute() {
  const { id, hash, expires, signature } = useLocalSearchParams<{
    id: string;
    hash: string;
    expires?: string;
    signature?: string;
  }>();

  return (
    <VerifyEmailScreen
      id={id}
      hash={hash}
      expires={expires}
      signature={signature}
    />
  );
}
