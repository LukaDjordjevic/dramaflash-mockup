import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GenreChips } from '@/components/GenreChips';
import { HeroSpotlight } from '@/components/HeroSpotlight';
import { Rail } from '@/components/Rail';
import { Text } from '@/components/Text';
import { genreChips } from '@/data/catalogue';
import type { Genre } from '@/data/types';
import { catalogue } from '@/services/catalogue';
import { colors, radius, space } from '@/theme';

type Chip = (typeof genreChips)[number];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [chip, setChip] = useState<Chip>('All');
  const spotlight = catalogue.spotlight();

  const rails = useMemo(() => {
    return catalogue.rails().map((rail) => {
      const items = catalogue.railSeries(rail);
      const filtered = chip === 'All' ? items : items.filter((s) => s.genres.includes(chip as Genre));
      return { rail, items: filtered };
    });
  }, [chip]);

  let lastSection: string | undefined;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }} showsVerticalScrollIndicator={false}>
        <HeroSpotlight series={spotlight} />
        <View style={styles.chips}>
          <GenreChips items={genreChips} value={chip} onChange={setChip} />
        </View>
        {rails.map(({ rail, items }) => {
          if (items.length === 0) return null;
          const showSection = rail.section && rail.section !== lastSection;
          lastSection = rail.section;
          return (
            <View key={rail.id}>
              {showSection ? <SectionTitle title={rail.section!} /> : null}
              <Rail title={rail.title} items={items} />
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <View style={styles.logo}>
          <Ionicons name="heart-outline" size={20} color={colors.black} />
        </View>
        <View style={styles.topActions}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
          <View>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.dot} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Profile">
            <Image source={require('../../../assets/cast/avatar.jpg')} style={styles.avatar} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const accent = title === 'Romance';
  return (
    <View style={styles.section}>
      <View style={[styles.sectionMark, { backgroundColor: accent ? colors.cyan : colors.white }]} />
      <Text variant="title" color={accent ? colors.purple : colors.text}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  chips: { marginTop: space.md },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: space.lg,
    marginTop: space.xxl,
    marginBottom: -space.sm,
  },
  sectionMark: { width: 22, height: 22, borderRadius: 3 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  dot: {
    position: 'absolute',
    top: 1,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  avatar: { width: 30, height: 30, borderRadius: 15 },
});
