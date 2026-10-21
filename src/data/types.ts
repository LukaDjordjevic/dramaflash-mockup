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
  /** Hand-written episodes. Series without a list get generated ones (see services/catalogue). */
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
  /** Full-bleed art shown behind the player until the first frame, and behind the lock. */
  art: Artwork;
  /** Bundled clip, a `require()` asset id. Every episode in the mock has one; locked ones play it once unlocked. */
  clip: number;
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

/** What the unlock sheet asked for; carried to the shop when the balance is short. */
export type UnlockIntent = 'episode' | 'season';
