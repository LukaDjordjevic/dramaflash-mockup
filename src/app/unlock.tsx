import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { UNLOCK_PRICES } from '@/data/types';
import { catalogue } from '@/services/catalogue';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius, space } from '@/theme';

type Option = 'episode' | 'season' | 'premium';

/** The "Continue the romance" sheet from the design, as a transparent modal over the player. */
export default function UnlockScreen() {
  const { seriesId, episodeId, episodeNumber } = useLocalSearchParams<{
    seriesId: string;
    episodeId: string;
    episodeNumber: string;
  }>();
  const series = catalogue.series(seriesId);
  const episode = catalogue.episodes(seriesId).find((e) => e.id === episodeId);
  const [option, setOption] = useState<Option>('season');
  const coins = useAppStore((s) => s.coins);
  const unlockEpisode = useAppStore((s) => s.unlockEpisode);
  const unlockSeason = useAppStore((s) => s.unlockSeason);
  const subscribePremium = useAppStore((s) => s.subscribePremium);

  const epNo = Number(episodeNumber) || episode?.number || 1;
  const lastEp = series?.episodeCount ?? 45;

  function confirm() {
    let result: 'ok' | 'insufficient' = 'ok';
    if (option === 'episode') result = unlockEpisode(episodeId);
    else if (option === 'season') result = unlockSeason(seriesId);
    else subscribePremium();

    if (result === 'insufficient') {
      const need = option === 'episode' ? UNLOCK_PRICES.episode : UNLOCK_PRICES.season;
      router.replace({ pathname: '/shop', params: { seriesId, episodeId, episodeNumber, need: String(need) } });
      return;
    }
    router.back();
  }

  return (
    <View style={styles.backdrop}>
      <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} accessibilityLabel="Maybe later" />
      </Animated.View>
      <Animated.View entering={SlideInDown.springify().damping(18)} style={styles.sheet}>
        <View style={styles.thumbWrap}>
          {episode ? <Image source={episode.art} style={styles.thumb} contentFit="cover" /> : null}
          <View style={styles.thumbDim} />
          <View style={styles.thumbLock}>
            <Ionicons name="lock-closed" size={22} color={colors.white} />
            <Text style={styles.lockedText}>LOCKED</Text>
          </View>
        </View>
        <Text style={styles.kicker}>EPISODE {epNo}</Text>
        <Text variant="title" style={styles.title}>
          Continue the romance
        </Text>
        <Text color={colors.textMuted} style={styles.lede}>
          Unlock all episodes and discover what happens next in their journey.
        </Text>

        <View style={styles.options}>
          <OptionRow
            selected={option === 'episode'}
            onPress={() => setOption('episode')}
            title="Unlock Episode"
            subtitle="One-time access"
            price={`${UNLOCK_PRICES.episode} Coins`}
          />
          <OptionRow
            selected={option === 'season'}
            onPress={() => setOption('season')}
            title="Unlock Full Season"
            subtitle={`Episodes ${epNo} - ${lastEp}`}
            price={`${UNLOCK_PRICES.season} Coins`}
            badge="BEST VALUE"
          />
          <OptionRow
            selected={option === 'premium'}
            onPress={() => setOption('premium')}
            title="Premium Membership"
            subtitle="Unlimited access"
            price={`$${UNLOCK_PRICES.premiumMonthlyUsd}/mo`}
          />
        </View>

        <Pressable style={styles.cta} onPress={confirm} accessibilityRole="button">
          <Ionicons name="lock-open-outline" size={18} color={colors.black} />
          <Text style={styles.ctaText}>Unlock Now</Text>
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
  selected,
  onPress,
  title,
  subtitle,
  price,
  badge,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  price: string;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Ionicons name="checkmark" size={12} color={colors.black} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ fontSize: 15 }}>
          {title}
        </Text>
        <Text variant="caption" color={colors.textFaint}>
          {subtitle}
        </Text>
      </View>
      <Text variant="label" color={selected ? colors.cyan : colors.text} style={{ fontSize: 14 }}>
        {price}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: space.lg },
  sheet: {
    backgroundColor: '#15173A',
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  thumbWrap: { width: 110, height: 140, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.card },
  thumb: { width: '100%', height: '100%' },
  thumbDim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  thumbLock: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 4 },
  lockedText: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.white, letterSpacing: 1 },
  kicker: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.cyan, letterSpacing: 1.5, marginTop: space.lg },
  title: { marginTop: 4 },
  lede: { textAlign: 'center', marginTop: 6, maxWidth: 280 },
  options: { alignSelf: 'stretch', gap: space.sm, marginTop: space.xl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: colors.cyan, backgroundColor: 'rgba(100,237,247,0.08)' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  badge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: colors.cyan,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.black, letterSpacing: 0.3 },
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
  ctaText: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.black },
  later: { marginTop: space.md },
  balance: { marginTop: space.md },
});
