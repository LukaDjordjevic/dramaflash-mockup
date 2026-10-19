// Wallet and entitlements. In-memory for the mock; the real app would back
// this with the account service and StoreKit / Play Billing receipts.
import { create } from 'zustand';

import { UNLOCK_PRICES } from '@/data/types';

interface AppState {
  coins: number;
  premium: boolean;
  unlockedEpisodes: Set<string>;
  unlockedSeasons: Set<string>;
  /** Series id → last watched episode number. */
  progress: Record<string, number>;

  isEpisodeUnlocked(episodeId: string, seriesId: string): boolean;
  unlockEpisode(episodeId: string): 'ok' | 'insufficient';
  unlockSeason(seriesId: string): 'ok' | 'insufficient';
  subscribePremium(): void;
  addCoins(amount: number): void;
  setProgress(seriesId: string, episodeNumber: number): void;
}

export const useAppStore = create<AppState>((set, get) => ({
  coins: 15,
  premium: false,
  unlockedEpisodes: new Set(),
  unlockedSeasons: new Set(),
  progress: {},

  isEpisodeUnlocked(episodeId, seriesId) {
    const s = get();
    return s.premium || s.unlockedSeasons.has(seriesId) || s.unlockedEpisodes.has(episodeId);
  },

  unlockEpisode(episodeId) {
    const { coins, unlockedEpisodes } = get();
    if (coins < UNLOCK_PRICES.episode) return 'insufficient';
    const next = new Set(unlockedEpisodes);
    next.add(episodeId);
    set({ coins: coins - UNLOCK_PRICES.episode, unlockedEpisodes: next });
    return 'ok';
  },

  unlockSeason(seriesId) {
    const { coins, unlockedSeasons } = get();
    if (coins < UNLOCK_PRICES.season) return 'insufficient';
    const next = new Set(unlockedSeasons);
    next.add(seriesId);
    set({ coins: coins - UNLOCK_PRICES.season, unlockedSeasons: next });
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
