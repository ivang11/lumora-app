import { useLocalSearchParams } from 'expo-router';

import { PersonScreen } from '@/features/person/PersonScreen';

export default function PersonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PersonScreen id={id} />;
}
