import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  useDeferredValue,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { tmdbMediaApi } from '@/api/tmdb/media';
import { PosterCard } from '@/components/media/PosterCard';
import { PersonCard } from '@/components/media/PersonCard';
import { AppText } from '@/components/ui/AppText';
import { hasTmdbConfiguration } from '@/config/env';
import { colors, radii, spacing } from '@/theme/tokens';

type SearchFilter = 'multi' | 'movie' | 'tv' | 'person';

const filters: { type: SearchFilter; label: string }[] = [
  { type: 'multi', label: 'Todo' },
  { type: 'movie', label: 'Películas' },
  { type: 'tv', label: 'Series' },
  { type: 'person', label: 'Personas' },
];

const fallbackSuggestions = ['Marvel', 'Breaking Bad', 'Inception', 'Severance'];

export function SearchScreen() {
  const { width } = useWindowDimensions();
  const columns = 3;
  const gridItemWidth =
    (width - spacing.md * 2 - spacing.sm * (columns - 1)) / columns;
  const inputRef = useRef<TextInput>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('multi');
  const deferredSearch = useDeferredValue(search.trim());
  const suggestions = useQuery({
    queryKey: ['tmdb', 'search', 'suggestions'],
    queryFn: async () => {
      const [movies, tv] = await Promise.all([
        tmdbMediaApi.category('movie', 'trending'),
        tmdbMediaApi.category('tv', 'trending'),
      ]);
      return [
        ...movies.results.slice(0, 4).map((item) => item.title ?? ''),
        ...tv.results.slice(0, 4).map((item) => item.name ?? ''),
      ].filter(Boolean);
    },
    enabled: hasTmdbConfiguration,
    staleTime: 60 * 60_000,
  });
  const results = useInfiniteQuery({
    queryKey: ['tmdb', 'search', deferredSearch],
    queryFn: ({ pageParam }) => tmdbMediaApi.search(deferredSearch, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: hasTmdbConfiguration && deferredSearch.length >= 2,
  });
  const allResults = results.data?.pages.flatMap((page) => page.results) ?? [];
  const filteredResults =
    filter === 'multi'
      ? allResults
      : allResults.filter((item) => item.media_type === filter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Buscar</AppText>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            accessibilityLabel="Buscar películas, series o personas"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Películas, series o personas"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
              hitSlop={8}
              onPress={() => {
                setSearch('');
                inputRef.current?.focus();
              }}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.clearButtonPressed,
              ]}>
              <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.filters}>
          {filters.map((item) => {
            const active = filter === item.type;
            return (
              <Pressable
                key={item.type}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(item.type)}
                style={[styles.filter, active && styles.filterActive]}>
                <AppText
                  variant="caption"
                  style={active ? styles.filterTextActive : undefined}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {deferredSearch.length < 2 ? (
        <View style={styles.center}>
          <AppText variant="heading">¿Qué quieres ver?</AppText>
          <AppText muted style={styles.centerText}>
            Busca películas, series o personas por su nombre.
          </AppText>
          <View style={styles.suggestions}>
            {(suggestions.data?.slice(0, 6) ?? fallbackSuggestions).map((title) => (
              <Pressable
                key={title}
                onPress={() => setSearch(title)}
                style={({ pressed }) => [
                  styles.suggestion,
                  pressed && styles.suggestionPressed,
                ]}>
                <AppText variant="caption">{title}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          key={`${filter}-${columns}`}
          numColumns={columns}
          columnWrapperStyle={styles.gridRow}
          data={filteredResults}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          renderItem={({ item }) => (
            <View style={[styles.gridItem, { width: gridItemWidth }]}>
              {item.media_type === 'person' ? (
                <PersonCard
                  id={item.id}
                  name={item.name ?? 'Sin nombre'}
                  subtitle={item.known_for_department}
                  profilePath={item.profile_path ?? null}
                  width={gridItemWidth}
                />
              ) : (
                <PosterCard
                  item={item}
                  mediaType={item.media_type === 'tv' ? 'tv' : 'movie'}
                  width={gridItemWidth}
                />
              )}
            </View>
          )}
          contentContainerStyle={styles.results}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (results.hasNextPage && !results.isFetchingNextPage) {
              void results.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <AppText muted style={styles.empty}>
              {results.isFetching ? 'Buscando…' : 'No hay resultados para este filtro.'}
            </AppText>
          }
          ListFooterComponent={
            results.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : null
          }
        />
      )}
    </View>
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
  inputContainer: {
    position: 'relative',
  },
  input: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingRight: 50,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonPressed: {
    opacity: 0.55,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filter: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 212, 200, 0.14)',
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  centerText: {
    textAlign: 'center',
  },
  suggestions: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  suggestion: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
  },
  suggestionPressed: {
    borderColor: colors.primary,
  },
  results: {
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
});
