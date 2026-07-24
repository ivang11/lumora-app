import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme/tokens';
import { tmdbImage } from '@/utils/media';

interface PersonCardProps {
  id: number;
  name: string;
  subtitle?: string;
  profilePath: string | null;
  width?: number;
}

export function PersonCard({
  id,
  name,
  subtitle,
  profilePath,
  width = 112,
}: PersonCardProps) {
  const image = tmdbImage(profilePath, 'w342');

  return (
    <Link
      href={{ pathname: '/person/[id]', params: { id: String(id) } }}
      asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ficha de ${name}`}
        style={({ pressed }) => [
          styles.card,
          { width },
          pressed && styles.pressed,
        ]}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={[styles.photo, { width, height: width * 1.29 }]}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.photo,
              styles.placeholder,
              { width, height: width * 1.29 },
            ]}>
            <AppText variant="title" muted>
              {name.slice(0, 1)}
            </AppText>
          </View>
        )}
        <AppText variant="label" numberOfLines={1}>
          {name}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" muted numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 112,
    gap: spacing.xs,
  },
  photo: {
    width: 112,
    height: 144,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
