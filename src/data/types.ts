import type { ImageSource } from 'expo-image';

/** A bundled `require()` asset or an expo-image source. */
export type Artwork = number | ImageSource;

export type Genre = 'Romance' | 'Drama' | 'Action' | 'Mystery' | 'Billionaire';

export interface Series {
  id: string;
  title: string;
  tagline: string;
  genres: Genre[];
  rating: number;
  ratingCount?: number;
  year?: number;
  episodeCount: number;
  minutesPerEpisode: number;
  pro: boolean;
  poster: Artwork;
  /** Landscape or tall key art for hero / detail headers. Falls back to poster. */
  keyArt?: Artwork;
  synopsis?: string;
  cast?: CastMember[];
  /** Episodes with real media. Series without a list get generated stubs. */
  episodes?: Episode[];
  /** Index (0-based) of the first episode that needs unlocking. */
  firstLockedIndex: number;
}

export interface CastMember {
  name: string;
  role: string;
  photo: Artwork;
}

export interface Episode {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  durationSec: number;
  thumb: Artwork;
  /** Full-bleed art shown behind the player / lock card. */
  art: Artwork;
  /** Bundled clip, a `require()` asset id. Locked episodes have none in the mock. */
  clip?: number;
  likes: number;
  comments: number;
}

export interface Rail {
  id: string;
  title: string;
  section?: 'Romance' | 'Popular Micro Dramas';
  seriesIds: string[];
}

export interface CoinPack {
  id: string;
  coins: number;
  bonus: number;
  priceEur: number;
  badge?: 'POPULAR' | 'BEST VALUE';
}

export const UNLOCK_PRICES = {
  episode: 10,
  season: 150,
  premiumMonthlyUsd: 9.99,
} as const;
