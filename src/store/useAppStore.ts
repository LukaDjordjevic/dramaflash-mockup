// Wallet and entitlements. In-memory for the mock; the real app would back
// this with the account service and StoreKit / Play Billing receipts.
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { UNLOCK_PRICES } from '@/data/types';

/** The slice that decides whether an episode is playable. */
export interface Entitlements {
  premium: boolean;
  unlockedEpisodes: ReadonlySet<string>;
  unlockedSeasons: ReadonlySet<string>;
}

export type UnlockResult = 'ok' | 'insufficient';

interface AppState extends Entitlements {
  coins: number;
  /** Series id → highest episode number reached. */
  progress: Record<string, number>;

  unlockEpisode(episodeId: string): UnlockResult;
  unlockSeason(seriesId: string): UnlockResult;
  /** Mock: flips premium on with no purchase behind it. */
  subscribePremium(): void;
  addCoins(amount: number): void;
  setProgress(seriesId: string, episodeNumber: number): void;
}

/** Pure, so screens and tests can use it without a hook. */
export function isUnlocked(e: Entitlements, episodeId: string, seriesId: string): boolean {
  return e.premium || e.unlockedSeasons.has(seriesId) || e.unlockedEpisodes.has(episodeId);
}

export const useAppStore = create<AppState>((set, get) => ({
  coins: 15,
  premium: false,
  unlockedEpisodes: new Set(),
  unlockedSeasons: new Set(),
  progress: {},

  unlockEpisode(episodeId) {
    const { coins, unlockedEpisodes } = get();
    if (coins < UNLOCK_PRICES.episode) return 'insufficient';
    set({ coins: coins - UNLOCK_PRICES.episode, unlockedEpisodes: new Set(unlockedEpisodes).add(episodeId) });
    return 'ok';
  },

  unlockSeason(seriesId) {
    const { coins, unlockedSeasons } = get();
    if (coins < UNLOCK_PRICES.season) return 'insufficient';
    set({ coins: coins - UNLOCK_PRICES.season, unlockedSeasons: new Set(unlockedSeasons).add(seriesId) });
    return 'ok';
  },

  subscribePremium() {
    set({ premium: true });
  },

  addCoins(amount) {
    set((s) => ({ coins: s.coins + amount }));
  },

  setProgress(seriesId, episodeNumber) {
    set((s) => ({ progress: { ...s.progress, [seriesId]: Math.max(s.progress[seriesId] ?? 0, episodeNumber) } }));
  },
}));

/** Subscribes to exactly the three fields that affect lock state. */
export function useEntitlements(): Entitlements {
  return useAppStore(
    useShallow((s) => ({ premium: s.premium, unlockedEpisodes: s.unlockedEpisodes, unlockedSeasons: s.unlockedSeasons })),
  );
}
