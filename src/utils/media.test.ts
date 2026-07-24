import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { mediaTitle, mediaYear, tmdbImage } from '@/utils/media';

describe('media utilities', () => {
  beforeAll(() => {
    vi.stubEnv('EXPO_PUBLIC_TMDB_IMAGE_URL', 'https://image.test/t/p');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('uses the movie title before the TV name', () => {
    expect(mediaTitle({ title: 'Dune', name: 'Ignored' })).toBe('Dune');
  });

  it('falls back to the TV name', () => {
    expect(mediaTitle({ name: 'Severance' })).toBe('Severance');
  });

  it('extracts a release year and handles missing dates', () => {
    expect(mediaYear({ release_date: '2024-03-01' })).toBe('2024');
    expect(mediaYear({})).toBe('—');
  });

  it('builds TMDB image URLs only when a path exists', () => {
    expect(tmdbImage('/poster.jpg', 'w342')).toContain('/w342/poster.jpg');
    expect(tmdbImage(null)).toBeNull();
  });
});
