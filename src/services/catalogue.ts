// Catalogue service. The mock reads fixtures; the real app would call the
// TargetVideo CMS. Keep the surface small so the swap is one file.
import { clipDurations, clips, librarySaved, rails, series, spotlightId } from '@/data/catalogue';
import type { Episode, Rail, Series } from '@/data/types';

const byId = new Map(series.map((s) => [s.id, s]));

export const catalogue = {
  allSeries(): Series[] {
    return series;
  },
  series(id: string): Series | undefined {
    return byId.get(id);
  },
  spotlight(): Series {
    return byId.get(spotlightId)!;
  },
  rails(): Rail[] {
    return rails;
  },
  railSeries(rail: Rail): Series[] {
    return rail.seriesIds.map((id) => byId.get(id)).filter((s): s is Series => !!s);
  },
  /** Episodes with media where the fixture has them, generated stubs otherwise. */
  episodes(seriesId: string): Episode[] {
    const s = byId.get(seriesId);
    if (!s) return [];
    if (s.episodes) return s.episodes;
    const count = Math.min(s.episodeCount, 6);
    return Array.from({ length: count }, (_, i) => ({
      id: `${s.id}-${i + 1}`,
      seriesId: s.id,
      number: i + 1,
      title: `Episode ${i + 1}`,
      durationSec: clipDurations[(i + 3) % clips.length],
      thumb: s.poster,
      art: s.keyArt ?? s.poster,
      clip: clips[(i + 3) % clips.length],
      likes: 8_000 + i * 310,
      comments: 120 + i * 17,
    }));
  },
  isLocked(s: Series, episodeNumber: number): boolean {
    return episodeNumber - 1 >= s.firstLockedIndex;
  },
  librarySaved() {
    return librarySaved
      .map((row) => ({ ...row, series: byId.get(row.seriesId) }))
      .filter((row): row is typeof row & { series: Series } => !!row.series);
  },
};
