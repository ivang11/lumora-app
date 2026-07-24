import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme/tokens';
import type { MediaListItem } from '@/types/media';
import { mediaTitle, tmdbImage } from '@/utils/media';

interface PosterCardProps {
  item: MediaListItem;
  mediaType?: 'movie' | 'tv';
  width?: number;
  showMetadata?: boolean;
}

export function PosterCard({
  item,
  mediaType = 'movie',
  width = 142,
  showMetadata = true,
}: PosterCardProps) {
  const image = tmdbImage(item.poster_path, 'w342');
  const year = item.release_date?.slice(0, 4) ?? item.first_air_date?.slice(0, 4);
  const rating =
    typeof item.vote_average === 'number' && item.vote_average > 0
      ? `★ ${item.vote_average.toFixed(1)}`
      : null;
  const metadata = [year, rating].filter(Boolean).join('  ·  ');
  const href =
    mediaType === 'movie'
      ? ({ pathname: '/movie/[id]', params: { id: String(item.id) } } as const)
      : ({ pathname: '/tv/[id]', params: { id: String(item.id) } } as const);

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${mediaTitle(item)}`}
        style={[styles.card, { width }]}>
        {({ pressed }) => (
          <View style={[styles.content, { width }, pressed && styles.pressed]}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={[styles.poster, { width, height: width * 1.5 }]}
                contentFit="cover"
                transition={180}
                recyclingKey={String(item.id)}
              />
            ) : (
              <View
                style={[
                  styles.poster,
                  styles.placeholder,
                  { width, height: width * 1.5 },
                ]}>
                <AppText muted variant="caption">
                  Sin imagen
                </AppText>
              </View>
            )}
            <AppText variant="label" numberOfLines={2} style={styles.title}>
              {mediaTitle(item)}
            </AppText>
            {showMetadata && metadata ? (
              <AppText variant="caption" muted>
                {metadata}
              </AppText>
            ) : null}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 142,
  },
  content: {
    width: 142,
    gap: spacing.xs,
  },
  title: {
    minHeight: 36,
  },
  poster: {
    width: 142,
    height: 213,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
