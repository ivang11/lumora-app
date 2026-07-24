import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { tmdbMediaApi } from '@/api/tmdb/media';
import { PosterCard } from '@/components/media/PosterCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors, spacing } from '@/theme/tokens';
import type { MediaType } from '@/types/api';

const categoryTitles: Record<string, string> = {
  trending: 'En tendencia',
  popular: 'Más populares',
  top_rated: 'Mejor valoradas',
  upcoming: 'Próximos estrenos',
  now_playing: 'En cines',
  on_the_air: 'En emisión',
  airing_today: 'Hoy en TV',
};

interface MediaListScreenProps {
  mediaType: MediaType;
  mode: 'category' | 'genre';
  identifier: string;
}

export function MediaListScreen({
  mediaType,
  mode,
  identifier,
}: MediaListScreenProps) {
  const { width } = useWindowDimensions();
  const columns = 3;
  const gridGap = spacing.sm;
  const gridItemWidth =
    (width - spacing.sm * 2 - gridGap * (columns - 1)) / columns;
  const genreList = useQuery({
    queryKey: ['tmdb', 'genres', mediaType],
    queryFn: () => tmdbMediaApi.genres(mediaType),
    enabled: mode === 'genre',
    staleTime: Infinity,
  });
  const title =
    mode === 'category'
      ? categoryTitles[identifier] ?? identifier
      : genreList.data?.genres.find((genre) => String(genre.id) === identifier)
          ?.name ?? 'Género';
  const listing = useInfiniteQuery({
    queryKey: ['tmdb', mode, mediaType, identifier],
    queryFn: ({ pageParam }) =>
      mode === 'category'
        ? tmdbMediaApi.category(mediaType, identifier, pageParam)
        : tmdbMediaApi.genre(mediaType, identifier, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
  const items = listing.data?.pages.flatMap((page) => page.results) ?? [];

  if (listing.isError) {
    return (
      <ErrorState
        message="No se ha podido cargar este listado."
        onRetry={() => void listing.refetch()}
      />
    );
  }

  return (
    <>
      <Stack.Title>{title}</Stack.Title>
      <View style={styles.container}>
        <FlatList
          key={columns}
          numColumns={columns}
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.gridItem, { width: gridItemWidth }]}>
              <PosterCard
                item={item}
                mediaType={mediaType}
                width={gridItemWidth}
              />
            </View>
          )}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (listing.hasNextPage && !listing.isFetchingNextPage) {
              void listing.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            listing.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={
            <AppText muted style={styles.empty}>
              {listing.isFetching ? 'Cargando…' : 'No hay contenido disponible.'}
            </AppText>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  gridItem: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  gridRow: {
    gap: spacing.sm,
  },
  loader: {
    padding: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    padding: spacing.xl,
  },
});
