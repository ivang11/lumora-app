import { useLocalSearchParams } from 'expo-router';

import { MediaDetailScreen } from '@/features/media/MediaDetailScreen';

export default function MovieRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MediaDetailScreen id={id} mediaType="movie" />;
}
