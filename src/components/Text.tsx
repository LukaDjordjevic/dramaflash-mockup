import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { colors, fonts } from '@/theme';

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'caption'
  /** Text inside a primary button. */
  | 'button'
  /** Small spaced uppercase kicker ("EPISODE 4", "SETTINGS & MORE"). */
  | 'overline'
  /** Tiny bold text inside a badge or pill. */
  | 'badge';

interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
}

/** The only place a font family is named. Every piece of text in the app goes through here. */
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
  button: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 20, color: colors.black },
  overline: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16, letterSpacing: 1.5, color: colors.textMuted },
  badge: { fontFamily: fonts.bodyBold, fontSize: 9, lineHeight: 12, letterSpacing: 0.4, color: colors.black },
});
