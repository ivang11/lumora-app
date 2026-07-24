import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { tmdbMediaApi } from '@/api/tmdb/media';
import { PosterCard } from '@/components/media/PosterCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors, radii, spacing } from '@/theme/tokens';
import { tmdbImage } from '@/utils/media';

interface PersonScreenProps {
  id: string;
}

export function PersonScreen({ id }: PersonScreenProps) {
  const person = useQuery({
    queryKey: ['tmdb', 'person', id],
    queryFn: () => tmdbMediaApi.person(id),
  });

  if (person.isError) {
    return (
      <ErrorState
        message="No se ha podido cargar esta persona."
        onRetry={() => void person.refetch()}
      />
    );
  }

  if (!person.data) {
    return (
      <View style={styles.loading}>
        <AppText muted>Cargando persona…</AppText>
      </View>
    );
  }

  const data = person.data;
  const profile = tmdbImage(data.profile_path);
  const works = Array.from(
    new Map(
      (data.combined_credits?.cast ?? [])
        .filter((work) => work.media_type === 'movie' || work.media_type === 'tv')
        .map((work) => [`${work.media_type}-${work.id}`, work]),
    ).values(),
  )
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 24);
  const photos = data.images?.profiles.slice(0, 16) ?? [];
  const age = getAge(data.birthday, data.deathday);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {profile ? (
          <Image source={{ uri: profile }} style={styles.profile} contentFit="cover" />
        ) : null}
        <View style={styles.identity}>
          <AppText variant="title">{data.name}</AppText>
          <AppText muted>
            {data.known_for_department}
            {age !== null ? ` · ${age} años` : ''}
          </AppText>
          {data.place_of_birth ? (
            <AppText variant="caption" muted>
              {data.place_of_birth}
            </AppText>
          ) : null}
        </View>
      </View>

      {data.biography ? (
        <View style={styles.section}>
          <AppText variant="heading">Biografía</AppText>
          <AppText muted>{data.biography}</AppText>
        </View>
      ) : null}

      {works.length ? (
        <View style={styles.section}>
          <AppText variant="heading">Conocido por</AppText>
          <FlatList
            horizontal
            data={works}
            keyExtractor={(work) => `${work.media_type}-${work.id}`}
            renderItem={({ item }) => (
              <PosterCard item={item} mediaType={item.media_type} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : null}

      {photos.length ? (
        <View style={styles.section}>
          <AppText variant="heading">Fotos</AppText>
          <FlatList
            horizontal
            data={photos}
            keyExtractor={(photo) => photo.file_path}
            renderItem={({ item }) => (
              <Image
                source={{ uri: tmdbImage(item.file_path, 'w500') ?? undefined }}
                style={styles.photo}
                contentFit="cover"
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

function getAge(birthday: string | null, deathday: string | null) {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const month = end.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && end.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
  },
  profile: {
    width: 132,
    height: 176,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
  },
  identity: {
    flex: 1,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  separator: {
    width: spacing.md,
  },
  photo: {
    width: 150,
    height: 210,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
  },
});
