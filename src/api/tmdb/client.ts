import { env, hasTmdbConfiguration } from '@/config/env';
import { HttpError } from '@/api/httpError';

export async function tmdbRequest<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  if (!hasTmdbConfiguration) {
    throw new Error(
      'Falta configurar EXPO_PUBLIC_TMDB_API_URL, EXPO_PUBLIC_TMDB_IMAGE_URL o EXPO_PUBLIC_TMDB_API_KEY.',
    );
  }

  const url = new URL(`${env.tmdbApiUrl}/${path.replace(/^\/+/, '')}`);
  url.searchParams.set('api_key', env.tmdbApiKey);
  url.searchParams.set('language', 'es-ES');

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url);
  const payload = (await response.json().catch(() => null)) as {
    status_message?: string;
  } | null;

  if (!response.ok) {
    throw new HttpError(payload?.status_message ?? 'TMDB no está disponible.', response.status);
  }

  return payload as T;
}
