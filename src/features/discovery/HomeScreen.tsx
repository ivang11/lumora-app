import { useQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { apiRequest } from '@/api/lumora/client';
import { tmdbMediaApi } from '@/api/tmdb/media';
import { PosterCard } from '@/components/media/PosterCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { hasTmdbConfiguration } from '@/config/env';
import { FollowingEpisodeCard } from '@/features/following/FollowingEpisodeCard';
import { useMarkFollowingEpisode } from '@/features/following/useMarkFollowingEpisode';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing } from '@/theme/tokens';
import type { FollowingShow, MediaListItem } from '@/types/media';

const discoveryGenres = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familiar' },
  { id: 14, name: 'Fantasía' },
  { id: 36, name: 'Historia' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Misterio' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ciencia ficción' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Western' },
] as const;

function rotatingGenres() {
  const today = new Date();
  const dayKey = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000,
  );
  const start = (dayKey * 3) % discoveryGenres.length;
  return Array.from(
    { length: 3 },
    (_, index) => discoveryGenres[(start + index) % discoveryGenres.length],
  );
}

interface MediaRowProps {
  title: string;
  items: MediaListItem[];
  mediaType?: 'movie' | 'tv';
  categoryName?: string;
  genreId?: number;
}

function MediaRow({
  title,
  items,
  mediaType = 'movie',
  categoryName,
  genreId,
}: MediaRowProps) {
  if (!items.length) return null;

  return (
    <View style={styles.row}>
      <View style={styles.rowHeading}>
        <AppText variant="heading">{title}</AppText>
        {categoryName || genreId ? (
          <Link
            href={
              genreId
                ? {
                    pathname: '/genre/[mediaType]/[id]',
                    params: { mediaType, id: String(genreId) },
                  }
                : {
                    pathname: '/category/[mediaType]/[name]',
                    params: { mediaType, name: categoryName! },
                  }
            }>
            <AppText variant="caption" style={styles.seeAll}>
              Ver todo
            </AppText>
          </Link>
        ) : null}
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PosterCard item={item} mediaType={mediaType} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

export function HomeScreen() {
  const token = useAuthStore((state) => state.token);
  const trendingMovies = useQuery({
    queryKey: ['tmdb', 'movie', 'trending'],
    queryFn: () => tmdbMediaApi.category('movie', 'trending'),
    enabled: hasTmdbConfiguration,
  });
  const topRatedMovies = useQuery({
    queryKey: ['tmdb', 'movie', 'top_rated'],
    queryFn: () => tmdbMediaApi.category('movie', 'top_rated'),
    enabled: hasTmdbConfiguration,
  });
  const popularMovies = useQuery({
    queryKey: ['tmdb', 'movie', 'popular'],
    queryFn: () => tmdbMediaApi.category('movie', 'popular'),
    enabled: hasTmdbConfiguration,
  });
  const nowPlayingMovies = useQuery({
    queryKey: ['tmdb', 'movie', 'now_playing'],
    queryFn: () => tmdbMediaApi.category('movie', 'now_playing'),
    enabled: hasTmdbConfiguration,
  });
  const upcomingMovies = useQuery({
    queryKey: ['tmdb', 'movie', 'upcoming'],
    queryFn: () => tmdbMediaApi.category('movie', 'upcoming'),
    enabled: hasTmdbConfiguration,
  });
  const trendingTv = useQuery({
    queryKey: ['tmdb', 'tv', 'trending'],
    queryFn: () => tmdbMediaApi.category('tv', 'trending'),
    enabled: hasTmdbConfiguration,
  });
  const topRatedTv = useQuery({
    queryKey: ['tmdb', 'tv', 'top_rated'],
    queryFn: () => tmdbMediaApi.category('tv', 'top_rated'),
    enabled: hasTmdbConfiguration,
  });
  const popularTv = useQuery({
    queryKey: ['tmdb', 'tv', 'popular'],
    queryFn: () => tmdbMediaApi.category('tv', 'popular'),
    enabled: hasTmdbConfiguration,
  });
  const onAirTv = useQuery({
    queryKey: ['tmdb', 'tv', 'on_the_air'],
    queryFn: () => tmdbMediaApi.category('tv', 'on_the_air'),
    enabled: hasTmdbConfiguration,
  });
  const airingTodayTv = useQuery({
    queryKey: ['tmdb', 'tv', 'airing_today'],
    queryFn: () => tmdbMediaApi.category('tv', 'airing_today'),
    enabled: hasTmdbConfiguration,
  });
  const selectedGenres = rotatingGenres();
  const genreQueries = useQueries({
    queries: selectedGenres.map((genre) => ({
      queryKey: ['tmdb', 'genre', 'movie', genre.id],
      queryFn: () => tmdbMediaApi.genre('movie', genre.id),
      enabled: hasTmdbConfiguration,
      staleTime: 30 * 60_000,
    })),
  });
  const following = useQuery({
    queryKey: ['lumora', 'following'],
    queryFn: () => apiRequest<FollowingShow[]>('/following-shows', { token }),
    enabled: Boolean(token),
  });

  const catalogQueries = [
    trendingMovies,
    topRatedMovies,
    popularMovies,
    nowPlayingMovies,
    upcomingMovies,
    trendingTv,
    topRatedTv,
    popularTv,
    onAirTv,
    airingTodayTv,
  ];
  const isRefreshing =
    catalogQueries.some((query) => query.isRefetching) ||
    genreQueries.some((query) => query.isRefetching) ||
    following.isRefetching;
  const refresh = () => {
    for (const query of catalogQueries) void query.refetch();
    for (const query of genreQueries) void query.refetch();
    if (token) void following.refetch();
  };

  if (!hasTmdbConfiguration) {
    return (
      <ErrorState
        title="Falta configurar TMDB"
        message="Copia .env.example a .env y configura las URLs y la API key de TMDB para cargar el catálogo."
      />
    );
  }

  if (catalogQueries.every((query) => query.isError)) {
    return (
      <ErrorState
        message="No hemos podido cargar el catálogo."
        onRetry={() => {
          for (const query of catalogQueries) void query.refetch();
        }}
      />
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <AppText variant="title">Lumora</AppText>
        <AppText muted>Tu colección personal de películas y series</AppText>
      </View>

      <MediaRow
        title="Ahora mismo"
        items={trendingMovies.data?.results.slice(0, 12) ?? []}
        categoryName="trending"
      />
      {following.data?.length ? <FollowingRow items={following.data} /> : null}
      <MediaRow
        title="Cine con nota"
        items={topRatedMovies.data?.results.slice(0, 12) ?? []}
        categoryName="top_rated"
      />
      <MediaRow
        title="Populares en películas"
        items={popularMovies.data?.results.slice(0, 12) ?? []}
        categoryName="popular"
      />
      <MediaRow
        title="Series que se mueven"
        items={trendingTv.data?.results.slice(0, 12) ?? []}
        mediaType="tv"
        categoryName="trending"
      />
      <MediaRow
        title="En cines"
        items={nowPlayingMovies.data?.results.slice(0, 12) ?? []}
        categoryName="now_playing"
      />
      <MediaRow
        title="Series imprescindibles"
        items={topRatedTv.data?.results.slice(0, 12) ?? []}
        mediaType="tv"
        categoryName="top_rated"
      />
      <MediaRow
        title="Populares en series"
        items={popularTv.data?.results.slice(0, 12) ?? []}
        mediaType="tv"
        categoryName="popular"
      />
      <MediaRow
        title="Próximos estrenos"
        items={upcomingMovies.data?.results.slice(0, 12) ?? []}
        categoryName="upcoming"
      />
      <MediaRow
        title="En emisión"
        items={onAirTv.data?.results.slice(0, 12) ?? []}
        mediaType="tv"
        categoryName="on_the_air"
      />
      <MediaRow
        title="Hoy en TV"
        items={airingTodayTv.data?.results.slice(0, 12) ?? []}
        mediaType="tv"
        categoryName="airing_today"
      />
      {selectedGenres.map((genre, index) => (
        <MediaRow
          key={genre.id}
          title={genre.name}
          items={genreQueries[index].data?.results.slice(0, 12) ?? []}
          genreId={genre.id}
        />
      ))}
    </ScrollView>
  );
}

function FollowingRow({ items }: { items: FollowingShow[] }) {
  const markWatched = useMarkFollowingEpisode();

  return (
    <View style={styles.row}>
      <View style={styles.rowHeading}>
        <AppText variant="heading">Próximos episodios</AppText>
        <Link href="/following">
          <AppText variant="caption" style={styles.seeAll}>
            Ver todo
          </AppText>
        </Link>
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.show.id)}
        renderItem={({ item }) => (
          <FollowingEpisodeCard
            item={item}
            disabled={markWatched.isPending}
            marking={
              markWatched.isPending &&
              markWatched.variables?.show.id === item.show.id
            }
            failed={
              markWatched.isError &&
              markWatched.variables?.show.id === item.show.id
            }
            onMarkWatched={(show) => markWatched.mutate(show)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  row: {
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  rowHeading: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  seeAll: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  separator: {
    width: spacing.md,
  },
});
