import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, type ListViewToken, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EpisodeCard } from '@/components/EpisodeCard';
import { Text } from '@/components/Text';
import type { Episode } from '@/data/types';
import { catalogue } from '@/services/catalogue';
import { useAppStore, useEntitlements } from '@/store/useAppStore';
import { colors, scrim, space } from '@/theme';

const viewabilityConfig = { itemVisiblePercentThreshold: 60 };

/** Vertical paged player. `?ep=N` opens on episode N (clamped to what exists). */
export default function WatchScreen() {
  const { id, ep } = useLocalSearchParams<{ id: string; ep?: string }>();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const series = catalogue.series(id);
  const episodes = catalogue.episodes(id);
  const listRef = useRef<FlatList<Episode>>(null);
  const startIndex = Math.max(0, Math.min(episodes.length - 1, (Number(ep) || 1) - 1));
  const [activeIndex, setActiveIndex] = useState(startIndex);

  const entitlements = useEntitlements();
  const setProgress = useAppStore((s) => s.setProgress);
  // One derived value drives every card's lock state; it is also the FlatList's
  // re-render key, so an unlock reaches the cards without any other plumbing.
  const lockedIds = useMemo(
    () => (series ? catalogue.lockedEpisodeIds(series, entitlements) : new Set<string>()),
    [series, entitlements],
  );

  useEffect(() => {
    const e = episodes[activeIndex];
    if (e && series) setProgress(series.id, e.number);
  }, [activeIndex, episodes, series, setProgress]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (first && typeof first.index === 'number') setActiveIndex(first.index);
  }, []);

  const openUnlock = useCallback(
    (e: Episode) => {
      if (!series) return;
      router.push({
        pathname: '/unlock',
        params: { seriesId: series.id, episodeId: e.id, episodeNumber: String(e.number) },
      });
    },
    [series],
  );

  const advanceFrom = useCallback(
    (index: number) => {
      if (index + 1 < episodes.length) listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    },
    [episodes.length],
  );

  if (!series) {
    return (
      <View style={styles.missing}>
        <Text>Series not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={episodes}
        keyExtractor={(e) => e.id}
        renderItem={({ item, index }) => {
          const next = episodes[index + 1];
          return (
            <EpisodeCard
              series={series}
              episode={item}
              index={index}
              height={height}
              active={index === activeIndex}
              locked={lockedIds.has(item.id)}
              nextLocked={!!next && lockedIds.has(next.id)}
              onAdvance={advanceFrom}
              onUnlock={openUnlock}
            />
          );
        }}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        // About three cards mounted at a time, so about three players.
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        extraData={lockedIds}
      />
      <View style={[styles.top, { top: insets.top + 4 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </Pressable>
        <Text variant="label" color={colors.textSoft}>
          {activeIndex + 1} / {episodes.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgFeed },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  top: {
    position: 'absolute',
    left: space.md,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: scrim(0.35),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
