import { useLocalSearchParams } from 'expo-router';

import { MediaListScreen } from '@/features/discovery/MediaListScreen';
import type { MediaType } from '@/types/api';

export default function CategoryRoute() {
  const { mediaType, name } = useLocalSearchParams<{
    mediaType: MediaType;
    name: string;
  }>();
  return (
    <MediaListScreen
      mediaType={mediaType}
      mode="category"
      identifier={name}
    />
  );
}
