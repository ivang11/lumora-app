import { useLocalSearchParams } from 'expo-router';

import { MediaDetailScreen } from '@/features/media/MediaDetailScreen';

export default function TvRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MediaDetailScreen id={id} mediaType="tv" />;
}
