import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors } from '@/theme';

export default function Screen() {
  const params = useLocalSearchParams();
  return (
    <View style={styles.screen}>
      <Text variant="heading">Coming in the next session</Text>
      <Text color={colors.textFaint}>{JSON.stringify(params)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.bg },
});
