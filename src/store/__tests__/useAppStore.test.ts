import { UNLOCK_PRICES } from '@/data/types';
import { isUnlocked, useAppStore } from '@/store/useAppStore';

const initial = useAppStore.getState();

beforeEach(() => {
  useAppStore.setState({
    ...initial,
    coins: 15,
    premium: false,
    unlockedEpisodes: new Set(),
    unlockedSeasons: new Set(),
    progress: {},
  });
});

describe('wallet', () => {
  it('starts with the balance from the design', () => {
    expect(useAppStore.getState().coins).toBe(15);
  });

  it('unlocks one episode and charges its price', () => {
    expect(useAppStore.getState().unlockEpisode('bs-4')).toBe('ok');
    const s = useAppStore.getState();
    expect(s.coins).toBe(15 - UNLOCK_PRICES.episode);
    expect(isUnlocked(s, 'bs-4', 'billionaires-secret')).toBe(true);
    expect(isUnlocked(s, 'bs-5', 'billionaires-secret')).toBe(false);
  });

  it('refuses an unlock the balance cannot cover and changes nothing', () => {
    expect(useAppStore.getState().unlockSeason('billionaires-secret')).toBe('insufficient');
    const s = useAppStore.getState();
    expect(s.coins).toBe(15);
    expect(s.unlockedSeasons.size).toBe(0);
  });

  it('unlocks a whole season once credited', () => {
    useAppStore.getState().addCoins(850);
    expect(useAppStore.getState().unlockSeason('billionaires-secret')).toBe('ok');
    const s = useAppStore.getState();
    expect(s.coins).toBe(865 - UNLOCK_PRICES.season);
    expect(isUnlocked(s, 'anything', 'billionaires-secret')).toBe(true);
    expect(isUnlocked(s, 'anything', 'other-series')).toBe(false);
  });

  it('premium unlocks everything without touching coins', () => {
    useAppStore.getState().subscribePremium();
    const s = useAppStore.getState();
    expect(isUnlocked(s, 'x', 'y')).toBe(true);
    expect(s.coins).toBe(15);
  });

  it('replaces the sets instead of mutating them, so subscribers see a change', () => {
    const before = useAppStore.getState().unlockedEpisodes;
    useAppStore.getState().unlockEpisode('bs-4');
    expect(useAppStore.getState().unlockedEpisodes).not.toBe(before);
    expect(before.size).toBe(0);
  });
});

describe('progress', () => {
  it('keeps the furthest episode reached', () => {
    const { setProgress } = useAppStore.getState();
    setProgress('s', 3);
    setProgress('s', 2);
    expect(useAppStore.getState().progress.s).toBe(3);
  });
});
