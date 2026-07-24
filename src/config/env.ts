const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const requireEnv = (name: string, value: string | undefined) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and configure it.`,
    );
  }

  return normalizedValue;
};

export const env = {
  get lumoraApiUrl() {
    return trimTrailingSlash(
      requireEnv(
        'EXPO_PUBLIC_LUMORA_API_URL',
        process.env.EXPO_PUBLIC_LUMORA_API_URL,
      ),
    );
  },
  get tmdbApiUrl() {
    return trimTrailingSlash(
      requireEnv(
        'EXPO_PUBLIC_TMDB_API_URL',
        process.env.EXPO_PUBLIC_TMDB_API_URL,
      ),
    );
  },
  get tmdbImageUrl() {
    return trimTrailingSlash(
      requireEnv(
        'EXPO_PUBLIC_TMDB_IMAGE_URL',
        process.env.EXPO_PUBLIC_TMDB_IMAGE_URL,
      ),
    );
  },
  get tmdbApiKey() {
    return requireEnv(
      'EXPO_PUBLIC_TMDB_API_KEY',
      process.env.EXPO_PUBLIC_TMDB_API_KEY,
    );
  },
} as const;

export const hasTmdbConfiguration = Boolean(
  process.env.EXPO_PUBLIC_TMDB_API_URL?.trim() &&
    process.env.EXPO_PUBLIC_TMDB_IMAGE_URL?.trim() &&
    process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim(),
);
