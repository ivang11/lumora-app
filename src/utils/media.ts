import { env } from '@/config/env';
import type { MediaListItem } from '@/types/media';

export const mediaTitle = (item: Pick<MediaListItem, 'title' | 'name'>) =>
  item.title ?? item.name ?? 'Sin título';

export const mediaYear = (
  item: Pick<MediaListItem, 'release_date' | 'first_air_date'>,
) => {
  const date = item.release_date ?? item.first_air_date;
  return date?.slice(0, 4) ?? '—';
};

export const tmdbImage = (
  path: string | null | undefined,
  size: 'w342' | 'w500' | 'w780' = 'w500',
) => (path ? `${env.tmdbImageUrl}/${size}${path}` : null);
