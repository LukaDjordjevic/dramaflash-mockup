import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { colors, fonts } from '@/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyMedium' | 'label' | 'caption';

interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
}

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  return <RNText {...rest} style={[styles.base, styles[variant], color ? { color } : null, style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.text },
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30 },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14, color: colors.textFaint },
});
