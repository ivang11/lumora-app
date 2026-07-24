# Lumora App

Lumora's mobile application, built with Expo SDK 57, React Native, Expo Router,
Zustand, and TanStack Query.

## Requirements

- Node.js 22.13 or later.
- npm.
- Expo Go compatible with SDK 57 or a development build.
- A TMDB v3 API key while the catalog is still queried directly.

## Configuration

```bash
cp .env.example .env
```

Configure `EXPO_PUBLIC_LUMORA_API_URL`, `EXPO_PUBLIC_TMDB_API_URL`,
`EXPO_PUBLIC_TMDB_IMAGE_URL`, and `EXPO_PUBLIC_TMDB_API_KEY` in `.env`. Replace
the placeholder API URL from `.env.example` with the URL for your environment.

The `EXPO_PUBLIC_*` variables are included in the client bundle and must not
contain private secrets. Direct TMDB access is temporary until a catalog proxy
is available in Laravel. The app will report a configuration error when a
required API URL is missing or empty.

## Running the App

```bash
npm install
npm start
```

The following commands are also available:

```bash
npm run ios
npm run android
npm run web
```

## Validation

```bash
npm run check
npx expo-doctor
npx expo export --platform web
```

## Architecture

- Zustand: hydrated session and local global state.
- SecureStore: JWT persistence on iOS and Android.
- TanStack Query: remote data, caching, and invalidation.
- `src/api/lumora`: Laravel backend.
- `src/api/tmdb`: TMDB catalog.
- `src/features`: domain-specific logic and screens.
- `src/app`: routes and navigation with Expo Router.

## Implemented Features

- Secure session restoration.
- Login, registration, password recovery and reset, email verification, and
  logout.
- Home, search, collection, and account tabs.
- Home screen with all editorial categories, rotating genres, and upcoming
  episodes.
- Paginated multi-search, type filters, and trending-based suggestions.
- Movie and TV show details with cast, crew, streaming providers, images, and
  videos.
- Full metadata, creators, production companies, IMDb links, recommendations,
  similar titles, and sharing.
- Person details with biography, credits, and photos.
- Paginated category and genre navigation.
- Favorites and collection statuses.
- Paginated movie and TV show collection filtered by status.
- Season selector and episode list.
- Individual episode and full-season tracking.
- Synchronized TV show progress.
- Account statistics, profile editing, and password changes.
- Password-protected account deletion.
- Pull-to-refresh, automatic reconnection, and a global offline notice.
- Lumora dark theme.

## Backend Changes Pending Deployment

The app includes deep-link routes using the `lumora://` scheme. To enable them
in production, deploy the `lumora-api` changes and configure:

```env
MOBILE_APP_URL=lumora://
```
