import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/api/lumora/client";
import type { ApiMediaType } from "@/types/api";
import type { ShowProgress } from "@/types/media";

export interface MediaActionState {
  id?: number;
  status?: number;
}

export interface MediaUserState {
  watchlist: MediaActionState | null;
  favorite: MediaActionState | null;
  watched_episode_ids: number[];
  progress?: ShowProgress;
}

export interface EpisodeWatchMutationResponse {
  watched: boolean;
  watched_episode_ids: number[];
  progress: ShowProgress;
  next_episode?: unknown;
}

export const emptyMediaState = (): MediaUserState => ({
  watchlist: null,
  favorite: null,
  watched_episode_ids: [],
});

export const mediaStateKey = (
  type: ApiMediaType,
  id: string,
  userId: number | null,
) => ["lumora", "media-state", userId ?? "guest", type, id] as const;

export function mediaStateQueryOptions(
  type: ApiMediaType,
  id: string,
  token: string | null,
  userId: number | null,
) {
  return queryOptions({
    queryKey: mediaStateKey(type, id, userId),
    queryFn: async () => {
      const state = await apiRequest<Partial<MediaUserState>>(
        `/user/media/${type}/${id}`,
        { token },
      );

      return {
        ...emptyMediaState(),
        ...state,
        watched_episode_ids: state.watched_episode_ids ?? [],
      };
    },
    enabled: Boolean(token),
  });
}
