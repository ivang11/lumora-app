import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { PersonCard } from '@/components/media/PersonCard';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme/tokens';
import type { MediaType } from '@/types/api';
import type { MovieDetails, TvDetails } from '@/types/media';

interface MediaMetadataProps {
  item: MovieDetails | TvDetails;
  mediaType: MediaType;
}

const tvStatus: Record<string, string> = {
  'Returning Series': 'En emisión',
  Ended: 'Finalizada',
  Canceled: 'Cancelada',
  'In Production': 'En producción',
  Planned: 'Planificada',
  Pilot: 'Piloto',
};

const tvTypes: Record<string, string> = {
  Scripted: 'Guionizada',
  Documentary: 'Documental',
  Reality: 'Reality',
  News: 'Noticias',
  Talk: 'Entrevistas',
  Miniseries: 'Miniserie',
};

function formatDate(value: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatCurrency(value: number) {
  if (!value) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function MediaMetadata({ item, mediaType }: MediaMetadataProps) {
  const movie = mediaType === 'movie' ? (item as MovieDetails) : null;
  const tv = mediaType === 'tv' ? (item as TvDetails) : null;
  const metadata = movie
    ? [
        ['Fecha de estreno', formatDate(movie.release_date)],
        ['Duración', movie.runtime ? `${movie.runtime} min` : null],
        ['Estado', movie.status === 'Released' ? 'Estrenada' : movie.status],
        [
          'Título original',
          movie.original_title !== movie.title ? movie.original_title : null,
        ],
        ['Idioma original', movie.original_language?.toUpperCase()],
        ['Presupuesto', formatCurrency(movie.budget)],
        ['Recaudación', formatCurrency(movie.revenue)],
      ]
    : [
        ['Primera emisión', formatDate(tv?.first_air_date ?? '')],
        ['Temporadas', tv?.number_of_seasons],
        ['Episodios', tv?.number_of_episodes],
        ['Estado', tv?.status ? (tvStatus[tv.status] ?? tv.status) : null],
        ['Título original', tv?.original_name !== tv?.name ? tv?.original_name : null],
        ['Idioma original', tv?.original_language?.toUpperCase()],
        [
          'Duración por episodio',
          tv?.episode_run_time[0] ? `${tv.episode_run_time[0]} min` : null,
        ],
        ['Cadena', tv?.networks.map((network) => network.name).join(', ')],
        ['Tipo', tv?.type ? (tvTypes[tv.type] ?? tv.type) : null],
      ];
  const populatedMetadata = metadata.filter((entry) => entry[1]);

  return (
    <View style={styles.section}>
      <AppText variant="heading">Detalles</AppText>
      <View style={styles.grid}>
        {populatedMetadata.map(([label, value]) => (
          <View key={String(label)} style={styles.detail}>
            <AppText variant="caption" muted style={styles.label}>
              {label}
            </AppText>
            <AppText>{String(value)}</AppText>
          </View>
        ))}
      </View>

      {item.external_ids?.imdb_id ? (
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL(
              `https://www.imdb.com/title/${item.external_ids?.imdb_id}`,
            )
          }
          style={({ pressed }) => [styles.imdb, pressed && styles.pressed]}>
          <AppText variant="label" style={styles.imdbText}>
            IMDb
          </AppText>
          <AppText variant="caption" style={styles.imdbText}>
            Ver ficha
          </AppText>
        </Pressable>
      ) : null}

      {tv?.created_by.length ? (
        <View style={styles.subsection}>
          <AppText variant="label">Creada por</AppText>
          <View style={styles.people}>
            {tv.created_by.map((creator) => (
              <PersonCard
                key={creator.id}
                id={creator.id}
                name={creator.name}
                profilePath={creator.profile_path}
              />
            ))}
          </View>
        </View>
      ) : null}

      {item.production_companies.length ? (
        <View style={styles.subsection}>
          <AppText variant="label">Productoras</AppText>
          <View style={styles.companies}>
            {item.production_companies.map((company) => (
              <View key={company.id} style={styles.company}>
                <AppText variant="caption">{company.name}</AppText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detail: {
    width: '46%',
    gap: spacing.xs,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
  },
  imdb: {
    minHeight: 42,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#f5c518',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imdbText: {
    color: colors.black,
    fontWeight: '900',
  },
  subsection: {
    gap: spacing.md,
  },
  people: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  companies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  company: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.72,
  },
});
