import { useLocalSearchParams } from 'expo-router';

import { MediaListScreen } from '@/features/discovery/MediaListScreen';
import type { MediaType } from '@/types/api';

export default function GenreRoute() {
  const { mediaType, id } = useLocalSearchParams<{
    mediaType: MediaType;
    id: string;
  }>();
  return (
    <MediaListScreen mediaType={mediaType} mode="genre" identifier={id} />
  );
}
