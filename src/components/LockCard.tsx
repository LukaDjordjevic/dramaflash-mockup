import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { colors, fonts, radius } from '@/theme';

/** The centred lock from the feed frame. `emphasis` slides it in — the cliffhanger moment. */
export function LockCard({
  title,
  subtitle,
  onPress,
  emphasis = false,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  emphasis?: boolean;
}) {
  const progress = useSharedValue(emphasis ? 0 : 1);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const anim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 40 }, { scale: 0.92 + progress.value * 0.08 }],
  }));

  return (
    <View pointerEvents="box-none" style={styles.centre}>
      <Animated.View style={anim}>
        <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]} accessibilityRole="button">
          <View style={styles.lockWrap}>
            <Ionicons name="lock-closed" size={30} color={colors.white} />
            <View style={styles.key}>
              <Ionicons name="key" size={12} color={colors.black} />
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text variant="caption" color={colors.textMuted}>
              {subtitle}
            </Text>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  card: {
    minWidth: 180,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(11,27,64,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 8,
  },
  lockWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  key: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.white },
});
