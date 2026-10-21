import { catalogue } from '@/services/catalogue';

describe('catalogue fixtures', () => {
  it('has a spotlight series and every rail entry resolves', () => {
    expect(catalogue.spotlight()).toBeDefined();
    for (const rail of catalogue.rails()) {
      expect(catalogue.railSeries(rail)).toHaveLength(rail.seriesIds.length);
    }
  });

  it('locks from episode 4 on every series', () => {
    for (const s of catalogue.allSeries()) {
      expect(catalogue.isLocked(s, 3)).toBe(false);
      expect(catalogue.isLocked(s, 4)).toBe(true);
    }
  });

  it('gives hand-written episodes to the featured series and generated ones elsewhere', () => {
    const featured = catalogue.episodes('billionaires-secret');
    expect(featured.map((e) => e.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(featured.slice(0, 3).every((e) => e.clip != null)).toBe(true);

    const generated = catalogue.episodes('verbotene-liebe');
    expect(generated).toHaveLength(6);
    expect(generated.every((e) => e.clip != null)).toBe(true);
    expect(generated[0].seriesId).toBe('verbotene-liebe');
  });

  it('returns the same episode list for repeated calls', () => {
    expect(catalogue.episodes('verbotene-liebe')).toBe(catalogue.episodes('verbotene-liebe'));
  });

  it('returns nothing for an unknown series', () => {
    expect(catalogue.series('nope')).toBeUndefined();
    expect(catalogue.episodes('nope')).toEqual([]);
  });

  it('library rows all point at real series', () => {
    const rows = catalogue.librarySaved();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.series.id).toBe(row.seriesId);
  });
});

describe('lock state after unlocks', () => {
  const s = catalogue.series('billionaires-secret')!;
  const none = { premium: false, unlockedEpisodes: new Set<string>(), unlockedSeasons: new Set<string>() };

  it('locks 4–6 with no entitlements', () => {
    expect([...catalogue.lockedEpisodeIds(s, none)]).toEqual(['bs-4', 'bs-5', 'bs-6']);
  });

  it('unlocking one episode leaves the others locked', () => {
    const e = { ...none, unlockedEpisodes: new Set(['bs-4']) };
    expect([...catalogue.lockedEpisodeIds(s, e)]).toEqual(['bs-5', 'bs-6']);
  });

  it('a season unlock or premium opens everything', () => {
    expect(catalogue.lockedEpisodeIds(s, { ...none, unlockedSeasons: new Set(['billionaires-secret']) }).size).toBe(0);
    expect(catalogue.lockedEpisodeIds(s, { ...none, premium: true }).size).toBe(0);
  });
});
