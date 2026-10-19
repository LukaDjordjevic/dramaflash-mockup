import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { PosterCard } from '@/components/PosterCard';
import { Text } from '@/components/Text';
import type { Series } from '@/data/types';
import { colors, space } from '@/theme';

export function Rail({ title, items, onSeeAll }: { title: string; items: Series[]; onSeeAll?: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text variant="heading">{title}</Text>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text variant="label" color={colors.cyan}>
            See all
          </Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => <PosterCard series={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        initialNumToRender={4}
      />
    </View>
  );
}

function Separator() {
  return <View style={{ width: space.md }} />;
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.xl },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: space.lg,
    marginBottom: space.md,
  },
  list: { paddingHorizontal: space.lg },
});
