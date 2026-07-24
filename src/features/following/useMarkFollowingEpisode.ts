import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/api/lumora/client';
import { useAuthStore } from '@/stores/authStore';
import type { FollowingShow } from '@/types/media';

function isFollowingEpisode(
  value: unknown,
): value is FollowingShow['next_episode'] {
  if (!value || typeof value !== 'object') return false;
  const episode = value as Record<string, unknown>;
  return typeof episode.id === 'number' && typeof episode.episode_number === 'number';
}

export function useMarkFollowingEpisode() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: FollowingShow) => {
      await apiRequest(`/episode/${item.next_episode.id}`, {
        method: 'POST',
        token,
        body: {
          show_id: item.show.id,
          season_number: item.next_episode.season.season_number,
          episode_number: item.next_episode.episode_number,
        },
      });

      const nextEpisode = await apiRequest<unknown>(
        `/show/${item.show.id}/next-episode`,
        { token },
      );

      return {
        showId: item.show.id,
        nextEpisode: isFollowingEpisode(nextEpisode) ? nextEpisode : null,
      };
    },
    onSuccess: ({ showId, nextEpisode }) => {
      queryClient.setQueryData<FollowingShow[]>(
        ['lumora', 'following'],
        (current = []) =>
          current.flatMap((item) => {
            if (item.show.id !== showId) return [item];
            return nextEpisode ? [{ ...item, next_episode: nextEpisode }] : [];
          }),
      );
      void queryClient.invalidateQueries({
        queryKey: ['lumora', 'user', 'stats'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['lumora', 'tv', String(showId)],
      });
    },
  });
}
