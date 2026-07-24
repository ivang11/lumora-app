import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { apiRequest } from '@/api/lumora/client';
import { PosterCard } from '@/components/media/PosterCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuthStore } from '@/stores/authStore';
import { colors, radii, spacing } from '@/theme/tokens';
import type { ApiMediaType, WatchStatus } from '@/types/api';
import type { WatchlistCollectionItem } from '@/types/media';

interface CollectionResponse {
  current_page: number;
  data: WatchlistCollectionItem[];
  next_page_url: string | null;
}

const statusLabels: Record<WatchStatus, string> = {
  seen: 'Vistas',
  pending: 'Pendientes',
  follow: 'Siguiendo',
  filed: 'Abandonadas',
};

export function CollectionScreen() {
  const token = useAuthStore((state) => state.token);
  const { width } = useWindowDimensions();
  const columns = 3;
  const gridItemWidth =
    (width - spacing.md * 2 - spacing.sm * (columns - 1)) / columns;
  const [mediaType, setMediaType] = useState<ApiMediaType>('movie');
  const [status, setStatus] = useState<WatchStatus>('seen');
  const availableStatuses: WatchStatus[] =
    mediaType === 'movie'
      ? ['seen', 'pending']
      : ['seen', 'pending', 'follow', 'filed'];

  const collection = useInfiniteQuery({
    queryKey: ['lumora', 'collection', mediaType, status],
    queryFn: ({ pageParam }) =>
      apiRequest<CollectionResponse>(
        `/user/watchlist/${mediaType}s?watchlist=${status}&page=${pageParam}`,
        { token },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.next_page_url ? lastPage.current_page + 1 : undefined,
    enabled: Boolean(token),
  });
  const items = collection.data?.pages.flatMap((page) => page.data) ?? [];

  const selectMediaType = (nextType: ApiMediaType) => {
    setMediaType(nextType);
    if (nextType === 'movie' && !['seen', 'pending'].includes(status)) {
      setStatus('seen');
    }
  };

  if (!token) {
    return (
      <View style={styles.guest}>
        <AppText variant="heading">Tu colección te espera</AppText>
        <AppText muted style={styles.guestText}>
          Inicia sesión para guardar películas y sincronizar tu progreso.
        </AppText>
        <Link href="/login" asChild>
          <Pressable style={styles.loginButton}>
            <AppText variant="label" style={styles.loginLabel}>
              Iniciar sesión
            </AppText>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (collection.isError) {
    return (
      <ErrorState
        message="No se ha podido cargar tu colección."
        onRetry={() => void collection.refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Mi Colección</AppText>
        <View style={styles.segment}>
          <SegmentButton
            label="Películas"
            active={mediaType === 'movie'}
            onPress={() => selectMediaType('movie')}
          />
          <SegmentButton
            label="Series"
            active={mediaType === 'show'}
            onPress={() => selectMediaType('show')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {availableStatuses.map((itemStatus) => (
            <FilterButton
              key={itemStatus}
              label={statusLabels[itemStatus]}
              active={status === itemStatus}
              onPress={() => setStatus(itemStatus)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        key={`${mediaType}-${columns}`}
        numColumns={columns}
        columnWrapperStyle={styles.gridRow}
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.gridItem, { width: gridItemWidth }]}>
            <PosterCard
              width={gridItemWidth}
              showMetadata={false}
              mediaType={mediaType === 'show' ? 'tv' : 'movie'}
              item={{
                id: item.id,
                title: item.title,
                name: item.name,
                overview: item.overview ?? '',
                poster_path: item.poster_path ?? null,
                backdrop_path: item.backdrop_path ?? null,
                release_date: item.release_date,
                first_air_date: item.first_air_date,
                vote_average: item.vote_average ?? 0,
              }}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (collection.hasNextPage && !collection.isFetchingNextPage) {
            void collection.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.45}
        refreshing={collection.isRefetching && !collection.isFetchingNextPage}
        onRefresh={() => void collection.refetch()}
        ListEmptyComponent={
          <AppText muted style={styles.empty}>
            {collection.isFetching
              ? 'Cargando…'
              : `No tienes ${mediaType === 'movie' ? 'películas' : 'series'} en este estado.`}
          </AppText>
        }
        ListFooterComponent={
          collection.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null
        }
      />
    </View>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        active && styles.segmentButtonActive,
        pressed && styles.controlPressed,
      ]}>
      <AppText
        variant="label"
        style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filter,
        active && styles.filterActive,
        pressed && styles.controlPressed,
      ]}>
      <AppText
        variant="label"
        style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  segment: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    padding: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
  },
  segmentButton: {
    minHeight: 38,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
  },
  segmentText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: colors.text,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filter: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.black,
    fontWeight: '800',
  },
  controlPressed: {
    opacity: 0.72,
  },
  list: {
    paddingHorizontal: spacing.md,
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
  empty: {
    textAlign: 'center',
    padding: spacing.xl,
  },
  loader: {
    padding: spacing.xl,
  },
  guest: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  guestText: {
    textAlign: 'center',
  },
  loginButton: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLabel: {
    color: colors.black,
  },
});
