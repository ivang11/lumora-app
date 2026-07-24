import type { MediaType } from '@/types/api';

export interface Genre {
  id: number;
  name: string;
}

export interface NamedCompany {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface ExternalIds {
  imdb_id?: string | null;
}

export interface Creator {
  id: number;
  name: string;
  original_name?: string;
  profile_path: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  known_for_department?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface TmdbImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
}

export interface ImagesCollection {
  backdrops: TmdbImage[];
  posters: TmdbImage[];
  profiles?: TmdbImage[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviderRegion {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProviders {
  results: Record<string, WatchProviderRegion>;
}

export interface SeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  runtime: number | null;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
}

export interface SeasonDetails extends SeasonSummary {
  episodes: Episode[];
}

export interface MediaListItem {
  id: number;
  media_type?: MediaType | 'person';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  status?: string;
  profile_path?: string | null;
  known_for_department?: string;
  popularity?: number;
}

export interface MovieDetails extends MediaListItem {
  title: string;
  original_title: string;
  original_language: string;
  release_date: string;
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  genres: Genre[];
  tagline: string;
  production_companies: NamedCompany[];
  external_ids?: ExternalIds;
  credits?: Credits;
  images?: ImagesCollection;
  videos?: { results: Video[] };
  'watch/providers'?: WatchProviders;
  recommendations?: PaginatedMedia;
  similar?: PaginatedMedia;
}

export interface TvDetails extends MediaListItem {
  name: string;
  original_name: string;
  original_language: string;
  first_air_date: string;
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  type: string;
  networks: NamedCompany[];
  created_by: Creator[];
  seasons: SeasonSummary[];
  genres: Genre[];
  tagline: string;
  production_companies: NamedCompany[];
  external_ids?: ExternalIds;
  credits?: Credits;
  images?: ImagesCollection;
  videos?: { results: Video[] };
  'watch/providers'?: WatchProviders;
  recommendations?: PaginatedMedia;
  similar?: PaginatedMedia;
}

export interface PaginatedMedia {
  page: number;
  results: MediaListItem[];
  total_pages: number;
  total_results: number;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  homepage: string | null;
  images?: { profiles: TmdbImage[] };
  combined_credits?: {
    cast: (MediaListItem & {
        media_type: 'movie' | 'tv';
        character?: string;
      })[];
    crew: (MediaListItem & {
        media_type: 'movie' | 'tv';
        job?: string;
      })[];
  };
}

export interface WatchlistCollectionItem {
  id: number;
  status: string;
  media_type?: MediaType;
  watchlistable?: MediaListItem;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

export interface WatchedEpisode {
  id: number;
  episode_id: number;
  season_id: number;
  show_id: number;
}

export interface ShowProgress {
  watched: number;
  total: number;
  percentage: number;
}

export interface FollowingShow {
  show: {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date?: string;
    tmdb_vote_average?: number;
  };
  next_episode: {
    id: number;
    name: string;
    episode_number: number;
    air_date: string | null;
    season: {
      id: number;
      name: string;
      season_number: number;
    };
  };
  watchlist_status: number;
}
