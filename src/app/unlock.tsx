import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { UNLOCK_PRICES, type UnlockIntent } from '@/data/types';
import { catalogue } from '@/services/catalogue';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, scrim, space } from '@/theme';

type Option = UnlockIntent | 'premium';

const ctaLabel: Record<Option, string> = {
  episode: `Unlock Episode for ${UNLOCK_PRICES.episode} Coins`,
  season: `Unlock Season for ${UNLOCK_PRICES.season} Coins`,
  premium: `Subscribe for $${UNLOCK_PRICES.premiumMonthlyUsd}/mo`,
};

/** Route params. All three are needed; a bare deep link closes the sheet. */
interface Params {
  seriesId?: string;
  episodeId?: string;
  episodeNumber?: string;
}

/** The "Continue the romance" sheet from the design, as a transparent modal over the player. */
export default function UnlockScreen() {
  // Typed routes only know the path; the search params arrive as strings or not at all.
  const { seriesId, episodeId, episodeNumber }: Params = useLocalSearchParams<Record<keyof Params, string>>();
  const series = seriesId ? catalogue.series(seriesId) : undefined;
  const episode = series ? catalogue.episodes(series.id).find((e) => e.id === episodeId) : undefined;
  const [option, setOption] = useState<Option>('season');
  const coins = useAppStore((s) => s.coins);
  const unlockEpisode = useAppStore((s) => s.unlockEpisode);
  const unlockSeason = useAppStore((s) => s.unlockSeason);
  const subscribePremium = useAppStore((s) => s.subscribePremium);

  if (!series || !episode) {
    router.back();
    return null;
  }

  const epNo = Number(episodeNumber) || episode.number;

  function confirm() {
    if (!series || !episode) return;
    if (option === 'premium') {
      subscribePremium(); // mock: no purchase behind it
      router.back();
      return;
    }
    const result = option === 'episode' ? unlockEpisode(episode.id) : unlockSeason(series.id);
    if (result === 'insufficient') {
      router.replace({
        pathname: '/shop',
        params: { seriesId: series.id, episodeId: episode.id, episodeNumber: String(epNo), intent: option },
      });
      return;
    }
    router.back();
  }

  return (
    <View style={styles.backdrop}>
      <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Maybe later" />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(220).easing(Easing.out(Easing.quad))} style={styles.sheet}>
        <View style={styles.thumbWrap}>
          <Image source={episode.art} style={styles.thumb} contentFit="cover" />
          <View style={styles.thumbDim} />
          <View style={styles.thumbLock}>
            <Ionicons name="lock-closed" size={22} color={colors.white} />
            <Text variant="badge" color={colors.white} style={styles.lockedText}>
              LOCKED
            </Text>
          </View>
        </View>
        <Text variant="overline" color={colors.cyan} style={styles.kicker}>
          EPISODE {epNo}
        </Text>
        <Text variant="title" style={styles.title}>
          Continue the romance
        </Text>
        <Text color={colors.textMuted} style={styles.lede}>
          Unlock all episodes and discover what happens next in their journey.
        </Text>

        <View style={styles.options} accessibilityRole="radiogroup">
          <OptionRow
            checked={option === 'episode'}
            onPress={() => setOption('episode')}
            title="Unlock Episode"
            subtitle="One-time access"
            price={`${UNLOCK_PRICES.episode} Coins`}
          />
          <OptionRow
            checked={option === 'season'}
            onPress={() => setOption('season')}
            title="Unlock Full Season"
            subtitle={`Episodes ${epNo} - ${series.episodeCount}`}
            price={`${UNLOCK_PRICES.season} Coins`}
            badge="BEST VALUE"
          />
          <OptionRow
            checked={option === 'premium'}
            onPress={() => setOption('premium')}
            title="Premium Membership"
            subtitle="Unlimited access"
            price={`$${UNLOCK_PRICES.premiumMonthlyUsd}/mo`}
          />
        </View>

        {/* The button names the checked option: "Full Season" is pre-checked as in the
            design, and a tap must not read as a single-episode unlock. */}
        <Pressable style={styles.cta} onPress={confirm} accessibilityRole="button">
          <Ionicons name="lock-open-outline" size={18} color={colors.black} />
          <Text variant="button">{ctaLabel[option]}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.later} accessibilityRole="button">
          <Text color={colors.textSoft}>Maybe Later</Text>
        </Pressable>
        <Text variant="caption" style={styles.balance}>
          Balance: {coins} coins
        </Text>
      </Animated.View>
    </View>
  );
}

function OptionRow({
  checked,
  onPress,
  title,
  subtitle,
  price,
  badge,
}: {
  checked: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  price: string;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, checked && styles.optionChecked]}
      accessibilityRole="radio"
      accessibilityState={{ checked }}
      accessibilityLabel={`${title}, ${price}`}>
      <View style={[styles.radio, checked && styles.radioChecked]}>
        {checked ? <Ionicons name="checkmark" size={12} color={colors.black} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ fontSize: 15 }}>
          {title}
        </Text>
        <Text variant="caption">{subtitle}</Text>
      </View>
      <Text variant="label" color={checked ? colors.cyan : colors.text} style={{ fontSize: 14 }}>
        {price}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text variant="badge">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: scrim(0.6), justifyContent: 'center', padding: space.lg },
  sheet: {
    backgroundColor: colors.sheet,
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: scrim(0.06, true),
  },
  thumbWrap: { width: 110, height: 140, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.card },
  thumb: { width: '100%', height: '100%' },
  thumbDim: { ...StyleSheet.absoluteFill, backgroundColor: scrim(0.5) },
  thumbLock: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 4 },
  lockedText: { fontSize: 10, letterSpacing: 1 },
  kicker: { marginTop: space.lg },
  title: { marginTop: 4 },
  lede: { textAlign: 'center', marginTop: 6, maxWidth: 280 },
  options: { alignSelf: 'stretch', gap: space.sm, marginTop: space.xl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: scrim(0.25),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChecked: { borderColor: colors.cyan, backgroundColor: 'rgba(100,237,247,0.08)' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioChecked: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  badge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: colors.cyan,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  cta: {
    alignSelf: 'stretch',
    height: 52,
    marginTop: space.xl,
    borderRadius: radius.md,
    backgroundColor: colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  later: { marginTop: space.md },
  balance: { marginTop: space.md },
});
