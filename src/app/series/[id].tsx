import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mmss } from '@/components/EpisodeCard';
import { PosterCard } from '@/components/PosterCard';
import { Text } from '@/components/Text';
import { UNLOCK_PRICES } from '@/data/types';
import { catalogue } from '@/services/catalogue';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius, space } from '@/theme';

export default function SeriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const series = catalogue.series(id);
  const episodes = catalogue.episodes(id);
  const isEpisodeUnlocked = useAppStore((s) => s.isEpisodeUnlocked);
  // Subscribed so the list re-renders when entitlements change.
  useAppStore((s) => s.unlockedEpisodes);
  useAppStore((s) => s.unlockedSeasons);
  useAppStore((s) => s.premium);
  const progress = useAppStore((s) => s.progress[id] ?? 0);

  if (!series) {
    return (
      <View style={styles.missing}>
        <Text>Series not found.</Text>
      </View>
    );
  }

  const next = Math.max(1, progress);
  const related = catalogue.allSeries().filter((s) => s.id !== series.id && s.genres.some((g) => series.genres.includes(g))).slice(0, 3);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={{ height: width * 1.05 }}>
          <Image source={series.keyArt ?? series.poster} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent', colors.bg]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
        </View>

        <View style={styles.body}>
          <View style={styles.tags}>
            {series.genres.map((g) => (
              <View key={g} style={styles.tag}>
                <Text variant="caption" color={colors.textSoft}>
                  {g}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="display" style={{ fontSize: 30, lineHeight: 36 }}>
            {series.title}
          </Text>
          <View style={styles.stats}>
            <Ionicons name="star-outline" size={14} color={colors.text} />
            <Text variant="bodyMedium">{series.rating.toFixed(1)}</Text>
            {series.ratingCount ? <Text color={colors.textFaint}>({compact(series.ratingCount)})</Text> : null}
            {series.year ? (
              <>
                <Text color={colors.textFaint}> • </Text>
                <Text variant="bodyMedium">{series.year}</Text>
              </>
            ) : null}
            <Text color={colors.textFaint}> • </Text>
            <Ionicons name="list-outline" size={14} color={colors.text} />
            <Text variant="bodyMedium">{series.episodeCount} Eps</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={styles.play}
              onPress={() => router.push({ pathname: '/watch/[id]', params: { id: series.id, ep: String(next) } })}
              accessibilityRole="button">
              <Ionicons name="play-outline" size={20} color={colors.black} />
              <Text style={styles.playText}>Play Ep {next}</Text>
            </Pressable>
            <Pressable style={styles.round} accessibilityRole="button" accessibilityLabel="Save">
              <Ionicons name="heart-outline" size={22} color={colors.text} />
            </Pressable>
          </View>

          {series.synopsis ? (
            <>
              <Text variant="heading" style={styles.h}>
                Synopsis
              </Text>
              <Text color={colors.textSoft} style={{ fontSize: 15, lineHeight: 23 }}>
                {series.synopsis}
              </Text>
            </>
          ) : (
            <Text color={colors.textSoft} style={[styles.h, { fontSize: 15 }]}>
              {series.tagline}
            </Text>
          )}

          {series.cast ? (
            <>
              <Text variant="heading" style={styles.h}>
                Cast & Crew
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
                {series.cast.map((c) => (
                  <View key={c.name} style={styles.castItem}>
                    <Image source={c.photo} style={styles.castPhoto} contentFit="cover" />
                    <Text variant="label" numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {c.role}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}

          <View style={[styles.epHead, styles.h]}>
            <Text variant="heading">Episodes</Text>
            <View style={styles.count}>
              <Text variant="caption" color={colors.textSoft}>
                {series.episodeCount}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text variant="label" color={colors.cyan}>
              Sort
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/unlock',
                params: { seriesId: series.id, episodeId: episodes[series.firstLockedIndex]?.id ?? '', episodeNumber: String(series.firstLockedIndex + 1) },
              })
            }
            accessibilityRole="button">
            <LinearGradient colors={['#2A1B4D', '#1C1B3A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bundle}>
              <View style={{ flex: 1 }}>
                <Text variant="heading" style={{ fontSize: 17 }}>
                  Unlock Full Season
                </Text>
                <Text variant="caption" color={colors.textSoft}>
                  {UNLOCK_PRICES.season} coins, or save 40% with the bundle
                </Text>
              </View>
              <View style={styles.bundlePrice}>
                <Text variant="label" color={colors.white}>
                  €9.99
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          {episodes.map((e) => {
            const locked = catalogue.isLocked(series, e.number) && !isEpisodeUnlocked(e.id, series.id);
            return (
              <Pressable
                key={e.id}
                style={styles.ep}
                onPress={() => router.push({ pathname: '/watch/[id]', params: { id: series.id, ep: String(e.number) } })}
                accessibilityRole="button">
                <View style={styles.epThumb}>
                  <Image source={e.thumb} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <View style={[styles.epIcon, locked && styles.epIconLocked]}>
                    <Ionicons name={locked ? 'lock-closed' : 'play'} size={locked ? 14 : 16} color={locked ? colors.white : colors.black} />
                  </View>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="heading" style={{ fontSize: 15, lineHeight: 20 }}>
                    {e.number}. {e.title}
                  </Text>
                  <View style={styles.epMeta}>
                    <Ionicons name="time-outline" size={12} color={colors.textFaint} />
                    <Text variant="caption">{mmss(e.durationSec)}</Text>
                    {locked ? (
                      <>
                        <Text variant="caption" color={colors.purple} style={{ marginLeft: 8 }}>
                          Unlock
                        </Text>
                        <Ionicons name="lock-closed-outline" size={11} color={colors.purple} />
                      </>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
          <View style={styles.more}>
            <Text variant="bodyMedium" color={colors.textSoft}>
              Show more episodes
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSoft} />
          </View>

          {related.length ? (
            <>
              <Text variant="heading" style={styles.h}>
                You might also like
              </Text>
              <View style={styles.related}>
                {related.map((s) => (
                  <PosterCard key={s.id} series={s} width={(width - space.lg * 2 - space.md * 2) / 3} />
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.top, { top: insets.top + 4 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.back}>
            <Ionicons name="heart-outline" size={20} color={colors.white} />
          </View>
          <View style={styles.back}>
            <Ionicons name="share-outline" size={20} color={colors.white} />
          </View>
        </View>
      </View>
    </View>
  );
}

function compact(n: number) {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  body: { paddingHorizontal: space.lg, marginTop: -space.xxl },
  tags: { flexDirection: 'row', gap: 8, marginBottom: space.md },
  tag: { backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg },
  play: {
    flex: 1,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  playText: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.black },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h: { marginTop: space.xl, marginBottom: space.sm },
  castItem: { width: 76, alignItems: 'center', gap: 2 },
  castPhoto: { width: 64, height: 64, borderRadius: 32, marginBottom: 4 },
  epHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  bundle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(203,100,247,0.35)',
    marginBottom: space.md,
  },
  bundlePrice: { backgroundColor: colors.purple, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  ep: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  epThumb: {
    width: 96,
    height: 60,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  epIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  epIconLocked: { backgroundColor: 'rgba(0,0,0,0.6)', paddingLeft: 0 },
  epMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: space.md },
  related: { flexDirection: 'row', gap: space.md },
  top: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
