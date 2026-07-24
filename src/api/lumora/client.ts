import { env } from '@/config/env';
import { HttpError } from '@/api/httpError';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string | null;
};

let unauthorizedHandler: (() => void | Promise<void>) | null = null;

export function setUnauthorizedHandler(handler: () => void | Promise<void>) {
  unauthorizedHandler = handler;
}

export async function apiRequest<T>(
  path: string,
  { body, token, headers, ...options }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${env.lumoraApiUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Locale: 'es',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
  } | null;

  if (!response.ok) {
    if (response.status === 401 && token && unauthorizedHandler) {
      await unauthorizedHandler();
    }
    throw new HttpError(
      payload?.message ?? payload?.error ?? 'No se pudo completar la solicitud.',
      response.status,
      payload?.errors,
    );
  }

  return payload as T;
}
