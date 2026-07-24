import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { apiRequest } from '@/api/lumora/client';
import { tmdbMediaApi } from '@/api/tmdb/media';
import { AppText } from '@/components/ui/AppText';
import { useAuthStore } from '@/stores/authStore';
import { colors, radii, spacing } from '@/theme/tokens';
import type {
  Episode,
  SeasonSummary,
  ShowProgress,
  WatchedEpisode,
} from '@/types/media';
import { tmdbImage } from '@/utils/media';

interface EpisodesSectionProps {
  showId: string;
  seasons: SeasonSummary[];
}

interface EpisodeMutationInput {
  episode: Episode;
  seasonNumber: number;
}

export function EpisodesSection({ showId, seasons }: EpisodesSectionProps) {
  const regularSeasons = useMemo(
    () => seasons.filter((season) => season.season_number > 0),
    [seasons],
  );
  const [activeSeasonNumber, setActiveSeasonNumber] = useState(
    regularSeasons.at(-1)?.season_number ?? 1,
  );
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const activeSeason = regularSeasons.find(
    (season) => season.season_number === activeSeasonNumber,
  );

  const season = useQuery({
    queryKey: ['tmdb', 'tv', showId, 'season', activeSeasonNumber],
    queryFn: () => tmdbMediaApi.season(showId, activeSeasonNumber),
  });
  const watched = useQuery({
    queryKey: ['lumora', 'tv', showId, 'season', activeSeasonNumber, 'watched'],
    queryFn: () =>
      apiRequest<WatchedEpisode[]>(
        `/user/watch/show/${showId}/season/${activeSeasonNumber}`,
        { token },
      ),
    enabled: Boolean(token),
    retry: false,
  });
  const progress = useQuery({
    queryKey: ['lumora', 'tv', showId, 'progress'],
    queryFn: () =>
      apiRequest<ShowProgress>(`/user/watch/show/${showId}/progress`, {
        token,
      }),
    enabled: Boolean(token),
  });

  const invalidateProgress = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['lumora', 'tv', showId, 'season', activeSeasonNumber, 'watched'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['lumora', 'tv', showId, 'progress'],
      }),
      queryClient.invalidateQueries({ queryKey: ['lumora', 'following'] }),
    ]);
  };

  const toggleEpisode = useMutation({
    mutationFn: ({ episode, seasonNumber }: EpisodeMutationInput) =>
      apiRequest(`/episode/${episode.id}`, {
        method: 'POST',
        token,
        body: {
          show_id: Number(showId),
          season_number: seasonNumber,
          episode_number: episode.episode_number,
        },
      }),
    onSuccess: invalidateProgress,
  });

  const toggleSeason = useMutation({
    mutationFn: () =>
      apiRequest(`/season/${activeSeason?.id}/watched`, {
        method: 'POST',
        token,
      }),
    onSuccess: invalidateProgress,
  });

  const watchedIds = useMemo(
    () => new Set((watched.data ?? []).map((item) => item.episode_id)),
    [watched.data],
  );
  const allWatched =
    Boolean(season.data?.episodes.length) &&
    season.data?.episodes.every((episode) => watchedIds.has(episode.id));

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <AppText variant="heading">Episodios</AppText>
          {token && progress.data ? (
            <AppText variant="caption" muted>
              {progress.data.watched} de {progress.data.total} vistos ·{' '}
              {progress.data.percentage}%
            </AppText>
          ) : null}
        </View>
        {!token ? (
          <Link href="/login" asChild>
            <Pressable>
              <AppText variant="caption" style={styles.link}>
                Inicia sesión para marcar
              </AppText>
            </Pressable>
          </Link>
        ) : null}
      </View>

      {token && progress.data ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(progress.data.percentage, 100)}%` },
            ]}
          />
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.seasonSelector}>
        {regularSeasons
          .slice()
          .reverse()
          .map((seasonItem) => {
            const active = seasonItem.season_number === activeSeasonNumber;
            return (
              <Pressable
                key={seasonItem.id}
                onPress={() => setActiveSeasonNumber(seasonItem.season_number)}
                style={({ pressed }) => [
                  styles.seasonPill,
                  active && styles.seasonPillActive,
                  pressed && styles.pressed,
                ]}>
                <AppText
                  variant="caption"
                  style={active ? styles.seasonTextActive : undefined}>
                  T{seasonItem.season_number}
                </AppText>
              </Pressable>
            );
          })}
      </ScrollView>

      {token && activeSeason ? (
        <Pressable
          disabled={toggleSeason.isPending}
          onPress={() => toggleSeason.mutate()}
          style={({ pressed }) => [
            styles.seasonAction,
            pressed && styles.pressed,
          ]}>
          <Ionicons
            name={allWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={allWatched ? colors.success : colors.textSecondary}
          />
          <AppText variant="label">
            {allWatched ? 'Desmarcar temporada' : 'Marcar temporada completa'}
          </AppText>
        </Pressable>
      ) : null}

      {season.isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.episodes}>
          {(season.data?.episodes ?? []).map((episode) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              watched={watchedIds.has(episode.id)}
              disabled={!token || toggleEpisode.isPending}
              onPress={() =>
                toggleEpisode.mutate({
                  episode,
                  seasonNumber: activeSeasonNumber,
                })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

function EpisodeRow({
  episode,
  watched,
  disabled,
  onPress,
}: {
  episode: Episode;
  watched: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const image = tmdbImage(episode.still_path, 'w500');

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: watched, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.episode,
        watched && styles.episodeWatched,
        pressed && styles.pressed,
      ]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.still} contentFit="cover" />
      ) : (
        <View style={[styles.still, styles.stillPlaceholder]} />
      )}
      <View style={styles.episodeContent}>
        <AppText variant="caption" muted>
          Episodio {episode.episode_number}
          {episode.runtime ? ` · ${episode.runtime} min` : ''}
        </AppText>
        <AppText variant="label" numberOfLines={1}>
          {episode.name}
        </AppText>
        {episode.overview ? (
          <AppText variant="caption" muted numberOfLines={2}>
            {episode.overview}
          </AppText>
        ) : null}
      </View>
      <Ionicons
        name={watched ? 'checkmark-circle' : 'ellipse-outline'}
        size={25}
        color={watched ? colors.success : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  headingText: {
    flex: 1,
    gap: spacing.xs,
  },
  link: {
    color: colors.primary,
  },
  progressTrack: {
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  seasonSelector: {
    gap: spacing.sm,
  },
  seasonPill: {
    minWidth: 48,
    minHeight: 38,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  seasonPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seasonTextActive: {
    color: colors.black,
    fontWeight: '800',
  },
  seasonAction: {
    minHeight: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  episodes: {
    gap: spacing.sm,
  },
  episode: {
    minHeight: 92,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  episodeWatched: {
    opacity: 0.72,
    borderColor: 'rgba(16, 185, 129, 0.55)',
  },
  still: {
    width: 112,
    height: 63,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  stillPlaceholder: {
    opacity: 0.8,
  },
  episodeContent: {
    flex: 1,
    gap: 2,
  },
  loader: {
    padding: spacing.xl,
  },
  pressed: {
    opacity: 0.68,
  },
});
