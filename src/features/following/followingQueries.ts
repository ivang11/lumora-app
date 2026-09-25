import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/api/lumora/client';
import type { FollowingShow } from '@/types/media';

export const followingKey = (userId: number | null) =>
  ['lumora', 'following', userId ?? 'guest'] as const;

export function followingQueryOptions(
  token: string | null,
  userId: number | null,
) {
  return queryOptions({
    queryKey: followingKey(userId),
    queryFn: ({ signal }) =>
      apiRequest<FollowingShow[]>('/following-shows', { token, signal }),
    enabled: Boolean(token),
  });
}
