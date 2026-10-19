import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors } from '@/theme';

export default function Screen() {
  return (
    <View style={styles.screen}>
      <Text variant="heading">Discover</Text>
      <Text color={colors.textFaint}>Not part of the mock-up.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.bg },
});
