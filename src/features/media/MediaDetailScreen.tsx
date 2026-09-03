import { usePrefetchQuery, useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tmdbMediaApi } from "@/api/tmdb/media";
import { PosterCard } from "@/components/media/PosterCard";
import { AppText } from "@/components/ui/AppText";
import { ErrorState } from "@/components/ui/ErrorState";
import { NavigationBackButton } from "@/components/ui/NavigationBackButton";
import { EpisodesSection } from "@/features/episodes/EpisodesSection";
import { MediaActions } from "@/features/media/MediaActions";
import { MediaExtras } from "@/features/media/MediaExtras";
import { MediaMetadata } from "@/features/media/MediaMetadata";
import { mediaStateQueryOptions } from "@/features/media/mediaQueries";
import { useAuthStore } from "@/stores/authStore";
import { colors, radii, spacing } from "@/theme/tokens";
import type { MediaType } from "@/types/api";
import type { MediaListItem, MovieDetails, TvDetails } from "@/types/media";
import { mediaTitle, mediaYear, tmdbImage } from "@/utils/media";

interface MediaDetailScreenProps {
  id: string;
  mediaType: MediaType;
}

export function MediaDetailScreen({ id, mediaType }: MediaDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const apiMediaType = mediaType === "movie" ? "movie" : "show";

  usePrefetchQuery(mediaStateQueryOptions(apiMediaType, id, token, userId));

  const detail = useQuery<MovieDetails | TvDetails>({
    queryKey: ["tmdb", mediaType, id],
    queryFn: () =>
      mediaType === "movie" ? tmdbMediaApi.movie(id) : tmdbMediaApi.tv(id),
  });
  const extras = useQuery<Partial<MovieDetails | TvDetails>>({
    queryKey: ["tmdb", mediaType, id, "extras"],
    queryFn: () =>
      mediaType === "movie"
        ? tmdbMediaApi.movieExtras(id)
        : tmdbMediaApi.tvExtras(id),
  });

  if (detail.isError) {
    return (
      <ErrorState
        message="No se ha podido cargar esta ficha."
        onRetry={() => void detail.refetch()}
      />
    );
  }

  if (!detail.data) {
    return (
      <View style={styles.loading}>
        <AppText muted>Cargando ficha…</AppText>
      </View>
    );
  }

  const item = { ...detail.data, ...extras.data } as MovieDetails | TvDetails;
  const backdrop = tmdbImage(item.backdrop_path, "w780");
  const poster = tmdbImage(item.poster_path);
  const recommendations = item.recommendations?.results ?? [];
  const similar = item.similar?.results ?? [];
  const runtime =
    mediaType === "movie"
      ? "runtime" in item
        ? item.runtime
        : null
      : "episode_run_time" in item
        ? item.episode_run_time[0]
        : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        refreshControl={
          <RefreshControl
            refreshing={detail.isRefetching}
            onRefresh={() => {
              void detail.refetch();
              void extras.refetch();
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {backdrop ? (
          <Image
            source={{ uri: backdrop }}
            style={styles.backdrop}
            contentFit="cover"
          />
        ) : (
          <View style={styles.backdrop} />
        )}
        <View style={styles.body}>
          <View style={styles.summary}>
            {poster ? (
              <Image
                source={{ uri: poster }}
                style={styles.poster}
                contentFit="cover"
              />
            ) : null}
            <View style={styles.summaryText}>
              <AppText variant="title">{mediaTitle(item)}</AppText>
              <AppText muted>
                {mediaYear(item)}
                {runtime ? ` · ${runtime} min` : ""}
                {item.vote_average
                  ? ` · ★ ${item.vote_average.toFixed(1)}`
                  : ""}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Compartir ${mediaTitle(item)}`}
                onPress={() =>
                  void Share.share({
                    title: mediaTitle(item),
                    message: `${mediaTitle(item)} · https://www.themoviedb.org/${mediaType}/${id}`,
                    url: `https://www.themoviedb.org/${mediaType}/${id}`,
                  })
                }
                style={({ pressed }) => [
                  styles.share,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="share-outline" size={17} color={colors.text} />
                <AppText variant="caption">Compartir</AppText>
              </Pressable>
              {"genres" in item ? (
                <AppText variant="caption" muted>
                  {item.genres.map((genre) => genre.name).join(" · ")}
                </AppText>
              ) : null}
            </View>
          </View>

          <MediaActions
            id={id}
            type={mediaType === "movie" ? "movie" : "show"}
          />

          <View style={styles.section}>
            <AppText variant="heading">Sinopsis</AppText>
            <AppText muted>
              {item.overview || "No hay sinopsis disponible."}
            </AppText>
          </View>

          <MediaMetadata item={item} mediaType={mediaType} />

          {mediaType === "tv" && "seasons" in item ? (
            <EpisodesSection showId={id} seasons={item.seasons} />
          ) : null}

          <MediaExtras
            mediaType={mediaType}
            genres={item.genres}
            credits={item.credits}
            images={item.images}
            videos={item.videos?.results}
            providers={item["watch/providers"]}
          />

          {recommendations.length ? (
            <RelatedMedia
              title="Recomendaciones"
              items={recommendations}
              mediaType={mediaType}
            />
          ) : null}

          {similar.length ? (
            <RelatedMedia
              title={
                mediaType === "tv" ? "Series similares" : "Películas similares"
              }
              items={similar}
              mediaType={mediaType}
            />
          ) : null}
        </View>
      </ScrollView>

      <NavigationBackButton
        style={[styles.backButton, { top: insets.top + spacing.sm }]}
      />
    </View>
  );
}

function RelatedMedia({
  title,
  items,
  mediaType,
}: {
  title: string;
  items: MediaListItem[];
  mediaType: MediaType;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      <FlatList
        horizontal
        data={items.slice(0, 12)}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PosterCard item={item} mediaType={mediaType} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  backdrop: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
  },
  backButton: {
    position: "absolute",
    left: spacing.lg,
    zIndex: 10,
    elevation: 10,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  summary: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: -56,
    alignItems: "flex-end",
  },
  poster: {
    width: 112,
    height: 168,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.background,
  },
  summaryText: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  share: {
    alignSelf: "flex-start",
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.68,
  },
  section: {
    gap: spacing.md,
  },
  separator: {
    width: spacing.md,
  },
});
