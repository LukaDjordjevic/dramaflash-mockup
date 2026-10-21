// Catalogue service. The mock reads fixtures; the real app would call the
// TargetVideo CMS. Keep the surface small so the swap is one file.
import { clipDurations, clips, librarySaved, rails, series, spotlightId } from '@/data/catalogue';
import type { Episode, Rail, Series } from '@/data/types';
import { type Entitlements, isUnlocked } from '@/store/useAppStore';

/** Series without hand-written episodes get this many generated ones. */
export const GENERATED_EPISODE_CAP = 6;

const byId = new Map(series.map((s) => [s.id, s]));
const generated = new Map<string, Episode[]>();

const spotlight = byId.get(spotlightId);
if (!spotlight) throw new Error(`Spotlight series "${spotlightId}" is not in the fixtures`);

function generateEpisodes(s: Series): Episode[] {
  const count = Math.min(s.episodeCount, GENERATED_EPISODE_CAP);
  return Array.from({ length: count }, (_, i) => {
    const clipIndex = (i + 3) % clips.length;
    return {
      id: `${s.id}-${i + 1}`,
      seriesId: s.id,
      number: i + 1,
      title: `Episode ${i + 1}`,
      durationSec: clipDurations[clipIndex],
      thumb: s.poster,
      art: s.keyArt ?? s.poster,
      clip: clips[clipIndex],
      likes: 8_000 + i * 310,
      comments: 120 + i * 17,
    };
  });
}

export const catalogue = {
  allSeries(): Series[] {
    return series;
  },
  series(id: string): Series | undefined {
    return byId.get(id);
  },
  spotlight(): Series {
    return spotlight;
  },
  rails(): Rail[] {
    return rails;
  },
  railSeries(rail: Rail): Series[] {
    return rail.seriesIds.flatMap((id) => byId.get(id) ?? []);
  },
  /** Hand-written episodes where the fixture has them, generated (and memoised) otherwise. */
  episodes(seriesId: string): Episode[] {
    const s = byId.get(seriesId);
    if (!s) return [];
    if (s.episodes) return s.episodes;
    let list = generated.get(seriesId);
    if (!list) {
      list = generateEpisodes(s);
      generated.set(seriesId, list);
    }
    return list;
  },
  /** The series' own rule: is this episode number behind the paywall at all? */
  isLocked(s: Series, episodeNumber: number): boolean {
    return episodeNumber - 1 >= s.firstLockedIndex;
  },
  /** The one lock decision screens should use: paywalled and not yet unlocked. */
  isEpisodeLocked(s: Series, episode: Episode, e: Entitlements): boolean {
    return catalogue.isLocked(s, episode.number) && !isUnlocked(e, episode.id, s.id);
  },
  /** Ids of every episode of a series the viewer cannot play right now. */
  lockedEpisodeIds(s: Series, e: Entitlements): ReadonlySet<string> {
    return new Set(catalogue.episodes(s.id).filter((ep) => catalogue.isEpisodeLocked(s, ep, e)).map((ep) => ep.id));
  },
  firstLockedEpisode(s: Series): Episode | undefined {
    return catalogue.episodes(s.id)[s.firstLockedIndex];
  },
  librarySaved() {
    return librarySaved.flatMap((row) => {
      const s = byId.get(row.seriesId);
      return s ? [{ ...row, series: s }] : [];
    });
  },
};
