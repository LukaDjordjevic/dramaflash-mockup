import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { coinPacks } from '@/data/catalogue';
import { UNLOCK_PRICES } from '@/data/types';
import { catalogue } from '@/services/catalogue';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius, space } from '@/theme';

/** Coin shop from the design. "Buy" is mocked: it credits the balance and, when the
 *  shop was opened for a locked episode, unlocks it and returns to the player. */
export default function ShopScreen() {
  const { seriesId, episodeId, episodeNumber, need } = useLocalSearchParams<{
    seriesId?: string;
    episodeId?: string;
    episodeNumber?: string;
    need?: string;
  }>();
  const insets = useSafeAreaInsets();
  const coins = useAppStore((s) => s.coins);
  const addCoins = useAppStore((s) => s.addCoins);
  const unlockEpisode = useAppStore((s) => s.unlockEpisode);
  const unlockSeason = useAppStore((s) => s.unlockSeason);
  const [packId, setPackId] = useState('c800');
  const pack = coinPacks.find((p) => p.id === packId)!;
  const series = seriesId ? catalogue.series(seriesId) : undefined;
  const episode = seriesId && episodeId ? catalogue.episodes(seriesId).find((e) => e.id === episodeId) : undefined;
  const needCoins = Number(need) || UNLOCK_PRICES.episode;

  function buy() {
    // Real app: StoreKit / Play Billing purchase, server-side receipt check, then credit.
    addCoins(pack.coins + pack.bonus);
    if (seriesId && episodeId) {
      if (needCoins >= UNLOCK_PRICES.season) unlockSeason(seriesId);
      else unlockEpisode(episodeId);
    }
    router.back();
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: 16, paddingBottom: 160 }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </Pressable>
          <Text variant="heading" style={{ fontSize: 20 }}>
            Unlock Episode
          </Text>
        </View>

        {series && episode ? (
          <View style={styles.epCard}>
            <View style={styles.epThumbWrap}>
              <Image source={episode.art} style={styles.epThumb} contentFit="cover" />
              <View style={styles.epLock}>
                <Ionicons name="lock-closed" size={12} color={colors.white} />
              </View>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading">{series.title}</Text>
              <Text color={colors.textMuted}>Episode {episodeNumber} • Locked</Text>
              <View style={styles.epPrice}>
                <Ionicons name="lock-closed" size={12} color={colors.cyan} />
                <Text variant="label" color={colors.cyan}>
                  Unlock for {needCoins} Coins
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.balance}>
          <Text color={colors.textMuted}>Your Balance</Text>
          <View style={styles.balanceRight}>
            <Ionicons name="flash-outline" size={16} color={colors.cyan} />
            <Text variant="label" style={{ fontSize: 16 }}>
              {coins} Coins
            </Text>
          </View>
        </View>

        <Text variant="title" style={styles.sectionTitle}>
          Recharge Coins
        </Text>
        <View style={styles.grid}>
          {coinPacks.map((p) => {
            const selected = p.id === packId;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPackId(p.id)}
                style={[styles.pack, selected && styles.packSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}>
                {p.badge ? (
                  <LinearGradient
                    colors={p.badge === 'POPULAR' ? [colors.cyan, colors.cyanDeep] : [colors.purple, colors.cyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.packBadge}>
                    <Text style={styles.packBadgeText}>{p.badge}</Text>
                  </LinearGradient>
                ) : null}
                {selected ? (
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.cyan} style={styles.packCheck} />
                ) : null}
                <Ionicons name="flash-outline" size={28} color={colors.cyan} style={{ marginTop: p.badge ? 26 : 10 }} />
                <Text variant="title" style={{ fontSize: 26 }}>
                  {p.coins}
                </Text>
                <Text variant="label" color={colors.purple} style={{ opacity: p.bonus ? 1 : 0 }}>
                  + {p.bonus} Bonus
                </Text>
                <View style={[styles.packPrice, selected && styles.packPriceSelected]}>
                  <Text variant="label" color={selected ? colors.black : colors.text}>
                    €{p.priceEur.toFixed(2)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.orRow}>
          <View style={styles.rule} />
          <Text variant="caption" style={{ letterSpacing: 1 }}>
            OR BEST DEAL
          </Text>
          <View style={styles.rule} />
        </View>
        <View style={styles.vip}>
          <View style={styles.vipIcon}>
            <Ionicons name="diamond-outline" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="heading">VIP Membership</Text>
            <Text color={colors.textMuted}>Free episodes • No ads</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="label" style={{ fontSize: 16 }}>
              €4.99
            </Text>
            <Text variant="caption">/ Week</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.trust}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.textFaint} />
          <Text variant="caption">Secure</Text>
          <Ionicons name="card-outline" size={14} color={colors.textFaint} style={{ marginLeft: 10 }} />
          <Text variant="caption">App Store Pay</Text>
        </View>
        <Pressable onPress={buy} style={styles.buy} accessibilityRole="button">
          <Text style={styles.buyText}>Buy {pack.coins} Coins</Text>
          <Text variant="caption" color={colors.textSoft}>
            for €{pack.priceEur.toFixed(2)}
          </Text>
        </Pressable>
        <Text variant="caption" style={styles.legal}>
          By purchasing, you agree to our Terms of Service. Subscriptions auto-renew unless canceled.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: space.lg },
  epCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  epThumbWrap: { width: 80, height: 110, borderRadius: radius.sm, overflow: 'hidden' },
  epThumb: { width: '100%', height: '100%' },
  epLock: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  epPrice: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(100,237,247,0.12)',
  },
  balance: {
    marginTop: space.lg,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 20, marginTop: space.xl, marginBottom: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  pack: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    gap: 4,
  },
  packSelected: { borderColor: colors.cyan, backgroundColor: '#0F1F2A' },
  packBadge: { position: 'absolute', top: 0, left: 0, right: 0, paddingVertical: 3, alignItems: 'center' },
  packBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.black, letterSpacing: 0.6 },
  packCheck: { position: 'absolute', top: 22, right: 8 },
  packPrice: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.black,
  },
  packPriceSelected: { backgroundColor: colors.cyan },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: space.xl },
  rule: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  vip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  vipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: 12,
    backgroundColor: 'rgba(10,10,24,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 10,
  },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  buy: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: { fontFamily: fonts.bodySemi, fontSize: 17, color: colors.cyan },
  legal: { textAlign: 'center' },
});
