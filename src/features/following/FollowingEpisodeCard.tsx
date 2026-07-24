import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme/tokens';
import type { FollowingShow } from '@/types/media';
import { tmdbImage } from '@/utils/media';

interface FollowingEpisodeCardProps {
  item: FollowingShow;
  width?: number;
  marking?: boolean;
  failed?: boolean;
  disabled?: boolean;
  onMarkWatched: (item: FollowingShow) => void;
}

export function FollowingEpisodeCard({
  item,
  width = 176,
  marking = false,
  failed = false,
  disabled = false,
  onMarkWatched,
}: FollowingEpisodeCardProps) {
  const router = useRouter();
  const image = tmdbImage(
    item.show.backdrop_path ?? item.show.poster_path,
    'w500',
  );
  const openShow = () =>
    router.push({
      pathname: '/tv/[id]',
      params: { id: String(item.show.id) },
    });

  return (
    <View style={[styles.card, { width }]}>
      <View style={[styles.imageWrapper, { height: width * 1.45 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${item.show.name}`}
          onPress={openShow}
          style={({ pressed }) => [
            styles.imageButton,
            pressed && styles.cardPressed,
          ]}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={180}
              recyclingKey={`following-${item.show.id}`}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.placeholder]} />
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            failed
              ? `Reintentar marcar ${item.next_episode.name} como visto`
              : `Marcar ${item.next_episode.name} como visto`
          }
          disabled={disabled}
          onPress={() => onMarkWatched(item)}
          style={({ pressed }) => [
            styles.watchedButton,
            failed && styles.watchedButtonFailed,
            pressed && styles.watchedButtonPressed,
            disabled && styles.disabled,
          ]}>
          {marking ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons
                name={failed ? 'refresh' : 'checkmark'}
                size={15}
                color={failed ? colors.favorite : colors.primary}
              />
              <AppText
                variant="caption"
                style={[styles.watchedText, failed && styles.watchedTextFailed]}>
                {failed ? 'Reintentar' : 'Visto'}
              </AppText>
            </>
          )}
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${item.show.name}`}
        onPress={openShow}
        style={({ pressed }) => [
          styles.info,
          pressed && styles.infoPressed,
        ]}>
        <AppText variant="label" numberOfLines={1} style={styles.title}>
          {item.show.name}
        </AppText>
        <View style={styles.episodeRow}>
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              T{item.next_episode.season.season_number}E
              {item.next_episode.episode_number}
            </AppText>
          </View>
          <AppText
            variant="caption"
            muted
            numberOfLines={1}
            style={styles.episodeName}>
            {item.next_episode.name}
          </AppText>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  imageWrapper: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  imageButton: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.86,
  },
  placeholder: {
    backgroundColor: colors.surfaceElevated,
  },
  info: {
    gap: spacing.xs,
  },
  infoPressed: {
    opacity: 0.7,
  },
  title: {
    fontWeight: '900',
  },
  episodeRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 212, 200, 0.22)',
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '900',
  },
  episodeName: {
    flex: 1,
  },
  watchedButton: {
    position: 'absolute',
    zIndex: 3,
    top: spacing.md,
    right: spacing.md,
    minWidth: 70,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 200, 0.62)',
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  watchedButtonFailed: {
    borderColor: 'rgba(224, 80, 80, 0.62)',
  },
  watchedButtonPressed: {
    backgroundColor: 'rgba(0, 212, 200, 0.24)',
  },
  watchedText: {
    color: colors.primary,
    fontWeight: '900',
  },
  watchedTextFailed: {
    color: colors.favorite,
  },
  disabled: {
    opacity: 0.6,
  },
});
