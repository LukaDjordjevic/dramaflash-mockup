// Design tokens lifted from the FLASH.svg hand-off (fills counted in the export).
export const colors = {
  bg: '#000000',
  bgFeed: '#061532',
  card: '#18172B',
  cardBorder: '#2A2945',
  /** The unlock sheet's panel. */
  sheet: '#15173A',
  /** A selected coin pack. */
  packSelected: '#0F1F2A',
  /** The lock card on the feed. */
  lockCard: 'rgba(11,27,64,0.9)',
  /** Sticky footer on the shop. */
  footer: 'rgba(10,10,24,0.96)',
  cyan: '#64EDF7',
  cyanDeep: '#34E8F4',
  purple: '#CB64F7',
  gold: '#FACC15',
  text: '#F3F4F6',
  textSoft: '#D1D5DB',
  textMuted: '#C0BEDA',
  textFaint: '#9CA3AF',
  black: '#000000',
  white: '#FFFFFF',
} as const;

/** Two-stop gradients used as card backgrounds. */
export const gradients = {
  brand: [colors.cyan, colors.purple] as const,
  popular: [colors.cyan, colors.cyanDeep] as const,
  bestValue: [colors.purple, colors.cyan] as const,
  profileCard: ['#1B1A38', '#1E1538'] as const,
  seasonBundle: ['#2A1B4D', '#1C1B3A'] as const,
};

/** Black / white scrims over imagery. Alpha as a fraction. */
export const scrim = (alpha: number, white = false) => `rgba(${white ? '255,255,255' : '0,0,0'},${alpha})`;

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Poster cards on the home rails: 3-up on a 390pt screen, 2:3 ratio.
export const poster = { width: 112, height: 168 } as const;
