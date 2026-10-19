import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Series } from '@/data/types';
import { colors, fonts, poster, radius } from '@/theme';

export function PosterCard({ series, width = poster.width }: { series: Series; width?: number }) {
  const height = (width * poster.height) / poster.width;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/series/[id]', params: { id: series.id } })}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={series.title}>
      <View style={[styles.frame, { width, height }]}>
        <Image source={series.poster} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.shade} />
        {series.pro ? <ProBadge /> : null}
        <View style={styles.meta}>
          <Text variant="caption" color={colors.textSoft}>
            {series.episodeCount} Eps
          </Text>
          <Text variant="caption" color={colors.textSoft}>
            {series.minutesPerEpisode}m/ep
          </Text>
        </View>
      </View>
      <Text variant="heading" style={styles.title} numberOfLines={2}>
        {series.title}
      </Text>
    </Pressable>
  );
}

export function ProBadge() {
  return (
    <LinearGradient colors={[colors.cyan, colors.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pro}>
      <Ionicons name="diamond" size={9} color={colors.black} />
      <Text style={styles.proText}>PRO</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  frame: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%' },
  meta: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pro: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  proText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.black, letterSpacing: 0.4 },
  title: { fontSize: 15, lineHeight: 19, marginTop: 8 },
});
