import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import type { Series } from '@/data/types';
import { catalogue } from '@/services/catalogue';
import { useAppStore, useEntitlements } from '@/store/useAppStore';
import { colors, gradients, radius, scrim, space } from '@/theme';

const settings: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'time-outline', label: 'Watch History' },
  { icon: 'card-outline', label: 'Purchases & Subscriptions' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

type Tab = 'Saved' | 'Purchases';

interface Row {
  series: Series;
  watched: number;
  badge?: 'New Eps' | 'Completed';
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('Saved');
  const entitlements = useEntitlements();
  const coins = useAppStore((s) => s.coins);
  const progress = useAppStore((s) => s.progress);

  const saved: Row[] = catalogue.librarySaved();
  // Purchases = anything the viewer has paid for in this session: a season, an
  // episode, or everything on premium. Reads the store, so an unlock shows up here.
  const purchased: Row[] = catalogue
    .allSeries()
    .filter(
      (s) =>
        entitlements.premium ||
        entitlements.unlockedSeasons.has(s.id) ||
        catalogue.episodes(s.id).some((e) => entitlements.unlockedEpisodes.has(e.id)),
    )
    .map((s) => ({ series: s, watched: progress[s.id] ?? 0 }));
  const rows = tab === 'Saved' ? saved : purchased;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: space.xxl }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="title">My Library</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <LinearGradient colors={gradients.profileCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profile}>
        <View style={styles.avatarRing}>
          <Image source={require('../../../assets/cast/avatar.jpg')} style={styles.avatar} accessibilityLabel="Profile photo" />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="heading">Sarah Connor</Text>
          <View style={styles.memberRow}>
            <Ionicons name={entitlements.premium ? 'diamond' : 'flash-outline'} size={13} color={colors.textSoft} />
            <Text variant="caption" color={colors.textSoft}>
              {entitlements.premium ? 'Premium Member' : `${coins} Coins`}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/shop')} accessibilityRole="button" accessibilityLabel="Manage coins">
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.manage}>
            <Text variant="button" style={{ fontSize: 14 }}>
              Manage
            </Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>

      <View style={styles.segment} accessibilityRole="tablist">
        {(['Saved', 'Purchases'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.segmentItem, tab === t && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}>
            <Text variant="label" color={tab === t ? colors.white : colors.textMuted}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {rows.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="lock-open-outline" size={28} color={colors.textFaint} />
          <Text color={colors.textMuted}>Nothing unlocked yet.</Text>
          <Text variant="caption">Unlock an episode or a season from the player and it shows up here.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {rows.map(({ series, watched, badge }) => {
            const ep = Math.max(watched, progress[series.id] ?? 0);
            return (
              <Pressable
                key={series.id}
                style={styles.cell}
                onPress={() => router.push({ pathname: '/watch/[id]', params: { id: series.id, ep: String(ep) } })}
                accessibilityRole="button"
                accessibilityLabel={`${series.title}, episode ${ep} of ${series.episodeCount}`}>
                <View style={styles.cellArt}>
                  <Image source={series.poster} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <LinearGradient colors={['transparent', scrim(0.8)]} style={styles.cellShade} />
                  {badge ? (
                    <View style={[styles.badge, badge === 'Completed' && styles.badgeDark]}>
                      <Text variant="badge" color={badge === 'Completed' ? colors.white : colors.black} style={{ fontSize: 10 }}>
                        {badge}
                      </Text>
                    </View>
                  ) : null}
                  <Text variant="caption" color={colors.cyan} style={styles.cellProgress}>
                    Ep {ep} / {series.episodeCount}
                  </Text>
                  <View style={[styles.cellBar, { width: `${Math.min(100, (ep / series.episodeCount) * 100)}%` }]} />
                </View>
                <Text variant="heading" style={styles.cellTitle} numberOfLines={1}>
                  {series.title}
                </Text>
                <View style={styles.cellMeta}>
                  <Ionicons name="heart-outline" size={11} color={colors.purple} />
                  <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {series.tagline}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text variant="overline" style={styles.sectionLabel}>
        SETTINGS & MORE
      </Text>
      <View style={styles.settings}>
        {settings.map((row, i) => (
          <Pressable
            key={row.label}
            style={[styles.row, i < settings.length - 1 && styles.rowBorder]}
            accessibilityRole="button"
            accessibilityLabel={row.label}>
            <View style={styles.rowIcon}>
              <Ionicons name={row.icon} size={18} color={colors.cyan} />
            </View>
            <Text variant="bodyMedium" style={{ flex: 1, fontSize: 15 }}>
              {row.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    marginBottom: space.lg,
  },
  profile: {
    marginHorizontal: space.lg,
    padding: 14,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: colors.cyan, padding: 2 },
  avatar: { width: '100%', height: '100%', borderRadius: 28 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  manage: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  segment: {
    marginHorizontal: space.lg,
    marginTop: space.xl,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  segmentItem: { paddingHorizontal: 22, paddingVertical: 8, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.black },
  empty: { alignItems: 'center', gap: 6, paddingVertical: space.xxl, paddingHorizontal: space.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: space.lg,
    marginTop: space.lg,
    columnGap: space.md,
    rowGap: space.lg,
  },
  cell: { width: '47%', flexGrow: 1 },
  cellArt: {
    aspectRatio: 0.68,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cellShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.cyan,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeDark: { backgroundColor: scrim(0.7) },
  cellProgress: { position: 'absolute', left: 8, bottom: 10 },
  cellBar: { position: 'absolute', left: 0, bottom: 0, height: 2, backgroundColor: colors.cyan },
  cellTitle: { fontSize: 15, lineHeight: 19, marginTop: 8 },
  cellMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  sectionLabel: { paddingHorizontal: space.lg, marginTop: space.xxl, marginBottom: space.md },
  settings: { marginHorizontal: space.lg, borderRadius: radius.lg, backgroundColor: colors.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(100,237,247,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
