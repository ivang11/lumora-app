export type MediaType = 'movie' | 'tv';
export type ApiMediaType = 'movie' | 'show';
export type WatchStatus = 'seen' | 'pending' | 'follow' | 'filed';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: {
    next: string | null;
  };
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}
