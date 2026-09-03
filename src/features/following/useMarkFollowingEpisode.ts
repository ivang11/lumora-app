import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/api/lumora/client";
import {
  emptyMediaState,
  mediaStateKey,
  type EpisodeWatchMutationResponse,
  type MediaUserState,
} from "@/features/media/mediaQueries";
import { useAuthStore } from "@/stores/authStore";
import type { FollowingShow } from "@/types/media";

function isFollowingEpisode(
  value: unknown,
): value is FollowingShow["next_episode"] {
  if (!value || typeof value !== "object") return false;
  const episode = value as Record<string, unknown>;
  return (
    typeof episode.id === "number" && typeof episode.episode_number === "number"
  );
}

export function useMarkFollowingEpisode() {
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: FollowingShow) => {
      const response = await apiRequest<EpisodeWatchMutationResponse>(
        `/show/${item.show.id}/episodes/${item.next_episode.id}/watched`,
        {
          method: "PUT",
          token,
          body: {
            watched: true,
            season_number: item.next_episode.season.season_number,
            episode_number: item.next_episode.episode_number,
          },
        },
      );

      return {
        showId: item.show.id,
        nextEpisode: isFollowingEpisode(response.next_episode)
          ? response.next_episode
          : null,
        response,
      };
    },
    onMutate: async (item) => {
      const followingKey = ["lumora", "following"] as const;
      await queryClient.cancelQueries({ queryKey: followingKey });
      const previous = queryClient.getQueryData<FollowingShow[]>(followingKey);

      queryClient.setQueryData<FollowingShow[]>(followingKey, (current = []) =>
        current.filter((following) => following.show.id !== item.show.id),
      );

      return { previous };
    },
    onError: (_error, _item, context) => {
      queryClient.setQueryData(["lumora", "following"], context?.previous);
    },
    onSuccess: ({ showId, nextEpisode, response }, _item, context) => {
      queryClient.setQueryData<FollowingShow[]>(
        ["lumora", "following"],
        (current = []) => {
          if (!nextEpisode) return current;

          const previous = context?.previous ?? [];
          const previousIndex = previous.findIndex(
            (item) => item.show.id === showId,
          );
          const previousItem = previous[previousIndex];
          if (!previousItem) return current;

          const updated = {
            ...previousItem,
            next_episode: nextEpisode,
          };
          const insertionIndex = Math.min(
            Math.max(previousIndex, 0),
            current.length,
          );

          return [
            ...current.slice(0, insertionIndex),
            updated,
            ...current.slice(insertionIndex),
          ];
        },
      );
      void queryClient.invalidateQueries({
        queryKey: ["lumora", "user", "stats"],
      });
      queryClient.setQueryData<MediaUserState>(
        mediaStateKey("show", String(showId), userId),
        (current) => ({
          ...(current ?? emptyMediaState()),
          watched_episode_ids: response.watched_episode_ids,
          progress: response.progress,
        }),
      );
    },
  });
}
