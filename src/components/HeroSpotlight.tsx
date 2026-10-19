import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Text } from '@/components/Text';
import type { Series } from '@/data/types';
import { colors, fonts, radius, space } from '@/theme';

export function HeroSpotlight({ series }: { series: Series }) {
  const { width } = useWindowDimensions();
  const height = Math.round(width * 1.33);
  return (
    <View style={{ height }}>
      <Image source={series.poster} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', colors.bg]}
        locations={[0, 0.35, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.body}>
        <View style={styles.tags}>
          <View style={styles.spot}>
            <Text style={styles.spotText}>Spotlight</Text>
          </View>
          {series.genres.map((g) => (
            <Text key={g} variant="bodyMedium" color={colors.textSoft}>
              {g} <Text color={colors.textFaint}>•</Text>
            </Text>
          ))}
        </View>
        <Text variant="display" style={styles.title}>
          {series.title}
        </Text>
        <Text color={colors.textSoft}>{series.tagline}</Text>
        <View style={styles.stats}>
          <Ionicons name="star-outline" size={14} color={colors.text} />
          <Text variant="bodyMedium">{series.rating.toFixed(1)}</Text>
          <Text color={colors.textFaint}> • </Text>
          <Text variant="bodyMedium">{series.episodeCount} Episoden</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={styles.play}
            onPress={() => router.push({ pathname: '/watch/[id]', params: { id: series.id } })}
            accessibilityRole="button">
            <Ionicons name="play-outline" size={20} color={colors.black} />
            <Text style={styles.playText}>Jetzt ansehen</Text>
          </Pressable>
          <Pressable style={styles.round} accessibilityRole="button" accessibilityLabel="Add to list">
            <Ionicons name="add" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { position: 'absolute', left: space.lg, right: space.lg, bottom: space.xl, gap: 6 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  spot: {
    backgroundColor: 'rgba(203,100,247,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  spotText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.purple },
  title: { marginTop: 2 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  play: {
    flex: 1,
    height: 52,
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
});
