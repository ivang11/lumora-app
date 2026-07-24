import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { apiRequest } from '@/api/lumora/client';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { FollowingEpisodeCard } from '@/features/following/FollowingEpisodeCard';
import { useMarkFollowingEpisode } from '@/features/following/useMarkFollowingEpisode';
import { useAuthStore } from '@/stores/authStore';
import { colors, radii, spacing } from '@/theme/tokens';
import type { FollowingShow } from '@/types/media';

export function FollowingScreen() {
  const token = useAuthStore((state) => state.token);
  const { width } = useWindowDimensions();
  const gap = spacing.md;
  const columns = Math.max(2, Math.floor((width - spacing.lg * 2 + gap) / 188));
  const cardWidth = (width - spacing.lg * 2 - gap * (columns - 1)) / columns;
  const following = useQuery({
    queryKey: ['lumora', 'following'],
    queryFn: () => apiRequest<FollowingShow[]>('/following-shows', { token }),
    enabled: Boolean(token),
  });
  const markWatched = useMarkFollowingEpisode();

  if (!token) {
    return (
      <View style={styles.center}>
        <AppText variant="heading">Inicia sesión para ver tus series</AppText>
        <Link href="/login" asChild>
          <Pressable style={styles.login}>
            <AppText variant="label" style={styles.loginText}>
              Iniciar sesión
            </AppText>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (following.isError) {
    return (
      <ErrorState
        message="No se han podido cargar tus próximos episodios."
        onRetry={() => void following.refetch()}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        key={columns}
        numColumns={columns}
        data={following.data ?? []}
        keyExtractor={(item) => String(item.show.id)}
        columnWrapperStyle={columns > 1 ? styles.columns : undefined}
        contentContainerStyle={styles.list}
        refreshing={following.isRefetching}
        onRefresh={() => void following.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title">Siguiendo</AppText>
            <AppText muted>
              Tus próximos episodios, listos para marcar sin entrar en cada serie.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <FollowingEpisodeCard
            item={item}
            width={cardWidth}
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
        ListEmptyComponent={
          following.isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.empty}>
              <AppText variant="heading">Estás al día</AppText>
              <AppText muted style={styles.emptyText}>
                No quedan episodios pendientes de las series que sigues.
              </AppText>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  columns: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  loader: {
    padding: spacing.xxl,
  },
  empty: {
    flex: 1,
    paddingVertical: 80,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
  center: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  login: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  loginText: {
    color: colors.black,
  },
});
