import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { catalogue } from '@/services/catalogue';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius, space } from '@/theme';

const settings: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'time-outline', label: 'Watch History' },
  { icon: 'card-outline', label: 'Purchases & Subscriptions' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'Saved' | 'Purchases'>('Saved');
  const premium = useAppStore((s) => s.premium);
  const coins = useAppStore((s) => s.coins);
  const progress = useAppStore((s) => s.progress);
  const saved = catalogue.librarySaved();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: space.xxl }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="title">My Library</Text>
        <Ionicons name="settings-outline" size={22} color={colors.text} />
      </View>

      <LinearGradient colors={['#1B1A38', '#1E1538']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profile}>
        <View style={styles.avatarRing}>
          <Image source={require('../../../assets/cast/avatar.jpg')} style={styles.avatar} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="heading">Sarah Connor</Text>
          <View style={styles.memberRow}>
            <Ionicons name={premium ? 'diamond' : 'flash-outline'} size={13} color={colors.textSoft} />
            <Text variant="caption" color={colors.textSoft}>
              {premium ? 'Premium Member' : `${coins} Coins`}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/shop')} accessibilityRole="button">
          <LinearGradient colors={[colors.cyan, colors.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.manage}>
            <Text style={styles.manageText}>Manage</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>

      <View style={styles.segment}>
        {(['Saved', 'Purchases'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segmentItem, tab === t && styles.segmentActive]}>
            <Text variant="label" color={tab === t ? colors.white : colors.textMuted}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        {saved.map(({ series, watched, badge }) => {
          const ep = Math.max(watched, progress[series.id] ?? 0);
          const locked = tab === 'Purchases' && !premium;
          return (
            <Pressable
              key={series.id}
              style={styles.cell}
              onPress={() => router.push({ pathname: '/watch/[id]', params: { id: series.id, ep: String(Math.min(ep, 6)) } })}
              accessibilityRole="button">
              <View style={styles.cellArt}>
                <Image source={series.poster} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cellShade} />
                {badge ? (
                  <View style={[styles.badge, badge === 'Completed' && styles.badgeDark]}>
                    <Text style={[styles.badgeText, badge === 'Completed' && { color: colors.white }]}>{badge}</Text>
                  </View>
                ) : locked ? (
                  <View style={styles.lock}>
                    <Ionicons name="lock-closed" size={12} color={colors.white} />
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
                <Text variant="caption" color={colors.textMuted}>
                  {series.tagline}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>SETTINGS & MORE</Text>
      <View style={styles.settings}>
        {settings.map((row, i) => (
          <View key={row.label} style={[styles.row, i < settings.length - 1 && styles.rowBorder]}>
            <View style={styles.rowIcon}>
              <Ionicons name={row.icon} size={18} color={colors.cyan} />
            </View>
            <Text variant="bodyMedium" style={{ flex: 1, fontSize: 15 }}>
              {row.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </View>
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
  manageText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.black },
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
  badgeDark: { backgroundColor: 'rgba(0,0,0,0.7)' },
  badgeText: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.black },
  lock: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellProgress: { position: 'absolute', left: 8, bottom: 10 },
  cellBar: { position: 'absolute', left: 0, bottom: 0, height: 2, backgroundColor: colors.cyan },
  cellTitle: { fontSize: 15, lineHeight: 19, marginTop: 8 },
  cellMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textMuted,
    paddingHorizontal: space.lg,
    marginTop: space.xxl,
    marginBottom: space.md,
  },
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
