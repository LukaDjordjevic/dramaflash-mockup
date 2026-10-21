import { FlatList, StyleSheet, View } from 'react-native';

import { PosterCard } from '@/components/PosterCard';
import { Text } from '@/components/Text';
import type { Series } from '@/data/types';
import { colors, space } from '@/theme';

export function Rail({ title, items }: { title: string; items: Series[] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text variant="heading">{title}</Text>
        {/* Design affordance; inert in the mock (see CLAUDE.md "Inert affordances"). */}
        <Text variant="label" color={colors.cyan}>
          See all
        </Text>
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
