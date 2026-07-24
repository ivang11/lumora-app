import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PersonCard } from '@/components/media/PersonCard';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme/tokens';
import type { MediaType } from '@/types/api';
import type {
  Credits,
  Genre,
  ImagesCollection,
  Video,
  WatchProviders,
} from '@/types/media';
import { tmdbImage } from '@/utils/media';

interface MediaExtrasProps {
  mediaType: MediaType;
  genres: Genre[];
  credits?: Credits;
  images?: ImagesCollection;
  videos?: Video[];
  providers?: WatchProviders;
}

export function MediaExtras({
  mediaType,
  genres,
  credits,
  images,
  videos,
  providers,
}: MediaExtrasProps) {
  const crew = Array.from(
    new Map((credits?.crew ?? []).map((member) => [member.id, member])).values(),
  ).slice(0, 16);
  const spanishProviders = providers?.results.ES;
  const providerItems = Array.from(
    new Map(
      [
        ...(spanishProviders?.flatrate ?? []),
        ...(spanishProviders?.rent ?? []),
        ...(spanishProviders?.buy ?? []),
      ].map((provider) => [provider.provider_id, provider]),
    ).values(),
  );
  const backdrops = images?.backdrops.slice(0, 16) ?? [];
  const youtubeVideos =
    videos?.filter((video) => video.site === 'YouTube').slice(0, 12) ?? [];

  return (
    <>
      {genres.length ? (
        <View style={styles.section}>
          <AppText variant="heading">Géneros</AppText>
          <View style={styles.genreList}>
            {genres.map((genre) => (
              <Link
                key={genre.id}
                href={{
                  pathname: '/genre/[mediaType]/[id]',
                  params: { mediaType, id: String(genre.id) },
                }}
                asChild>
                <Pressable style={styles.genre}>
                  <AppText variant="caption">{genre.name}</AppText>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ) : null}

      {credits?.cast.length ? (
        <View style={styles.section}>
          <AppText variant="heading">Reparto</AppText>
          <ScrollView
            horizontal
            contentContainerStyle={styles.horizontal}
            showsHorizontalScrollIndicator={false}>
            {credits.cast.slice(0, 20).map((member) => (
              <PersonCard
                key={member.id}
                id={member.id}
                name={member.name}
                subtitle={member.character}
                profilePath={member.profile_path}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {crew.length ? (
        <View style={styles.section}>
          <AppText variant="heading">Equipo</AppText>
          <ScrollView
            horizontal
            contentContainerStyle={styles.horizontal}
            showsHorizontalScrollIndicator={false}>
            {crew.map((member) => (
              <PersonCard
                key={member.id}
                id={member.id}
                name={member.name}
                subtitle={member.job}
                profilePath={member.profile_path}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {providerItems.length ? (
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <AppText variant="heading">Dónde ver</AppText>
            <AppText variant="caption" muted>
              Disponibilidad en España
            </AppText>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={styles.horizontal}
            showsHorizontalScrollIndicator={false}>
            {providerItems.map((provider) => (
              <Pressable
                key={provider.provider_id}
                accessibilityRole="link"
                onPress={() => {
                  if (spanishProviders?.link) {
                    void Linking.openURL(spanishProviders.link);
                  }
                }}
                style={styles.provider}>
                <Image
                  source={{ uri: tmdbImage(provider.logo_path, 'w342') ?? undefined }}
                  style={styles.providerLogo}
                  contentFit="cover"
                />
                <AppText variant="caption" numberOfLines={2} style={styles.providerName}>
                  {provider.provider_name}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {backdrops.length ? (
        <View style={styles.section}>
          <AppText variant="heading">Imágenes</AppText>
          <ScrollView
            horizontal
            contentContainerStyle={styles.horizontal}
            showsHorizontalScrollIndicator={false}>
            {backdrops.map((image) => (
              <Image
                key={image.file_path}
                source={{ uri: tmdbImage(image.file_path, 'w780') ?? undefined }}
                style={styles.backdrop}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {youtubeVideos.length ? (
        <View style={styles.section}>
          <AppText variant="heading">Vídeos</AppText>
          <View style={styles.videoList}>
            {youtubeVideos.map((video) => (
              <VideoButton key={video.id} video={video} />
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
}

function VideoButton({ video }: { video: Video }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => void Linking.openURL(`https://www.youtube.com/watch?v=${video.key}`)}
      style={({ pressed }) => [styles.video, pressed && styles.pressed]}>
      <View style={styles.play}>
        <Ionicons name="play" size={19} color={colors.black} />
      </View>
      <View style={styles.videoText}>
        <AppText variant="label" numberOfLines={1}>
          {video.name}
        </AppText>
        <AppText variant="caption" muted>
          {video.type}
        </AppText>
      </View>
      <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionHeading: {
    gap: spacing.xs,
  },
  horizontal: {
    gap: spacing.md,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genre: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provider: {
    width: 78,
    gap: spacing.sm,
    alignItems: 'center',
  },
  providerLogo: {
    width: 58,
    height: 58,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
  },
  providerName: {
    textAlign: 'center',
  },
  backdrop: {
    width: 260,
    height: 146,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
  },
  videoList: {
    gap: spacing.sm,
  },
  video: {
    minHeight: 58,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  play: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoText: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.68,
  },
});
