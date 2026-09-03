import { tmdbRequest } from "@/api/tmdb/client";
import type {
  MovieDetails,
  PaginatedMedia,
  PersonDetails,
  SeasonDetails,
  TvDetails,
} from "@/types/media";

export const tmdbMediaApi = {
  trendingMovies: () => tmdbRequest<PaginatedMedia>("trending/movie/week"),
  popularMovies: () => tmdbRequest<PaginatedMedia>("movie/popular"),
  trendingTv: () => tmdbRequest<PaginatedMedia>("trending/tv/week"),
  popularTv: () => tmdbRequest<PaginatedMedia>("tv/popular"),
  search: (query: string, page = 1) =>
    tmdbRequest<PaginatedMedia>("search/multi", {
      query,
      page,
      include_adult: false,
    }),
  movie: (id: string | number) => tmdbRequest<MovieDetails>(`movie/${id}`),
  movieExtras: (id: string | number) =>
    tmdbRequest<Partial<MovieDetails>>(`movie/${id}`, {
      append_to_response:
        "credits,images,videos,watch/providers,recommendations,similar,release_dates,external_ids",
      include_image_language: "es,en,null",
    }),
  tv: (id: string | number) => tmdbRequest<TvDetails>(`tv/${id}`),
  tvExtras: (id: string | number) =>
    tmdbRequest<Partial<TvDetails>>(`tv/${id}`, {
      append_to_response:
        "credits,images,videos,watch/providers,recommendations,similar,content_ratings,external_ids",
      include_image_language: "es,en,null",
    }),
  season: (showId: string | number, seasonNumber: number) =>
    tmdbRequest<SeasonDetails>(`tv/${showId}/season/${seasonNumber}`),
  person: (id: string | number) =>
    tmdbRequest<PersonDetails>(`person/${id}`, {
      append_to_response: "images,combined_credits,external_ids",
      include_image_language: "es,en,null",
    }),
  category: (mediaType: "movie" | "tv", name: string, page = 1) =>
    name === "trending"
      ? tmdbRequest<PaginatedMedia>(`trending/${mediaType}/week`, { page })
      : tmdbRequest<PaginatedMedia>(`${mediaType}/${name}`, { page }),
  genre: (mediaType: "movie" | "tv", genreId: string | number, page = 1) =>
    tmdbRequest<PaginatedMedia>(`discover/${mediaType}`, {
      with_genres: genreId,
      include_adult: false,
      page,
    }),
  genres: (mediaType: "movie" | "tv") =>
    tmdbRequest<{ genres: { id: number; name: string }[] }>(
      `genre/${mediaType}/list`,
    ),
};
