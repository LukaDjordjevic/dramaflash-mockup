// Design tokens lifted from the FLASH.svg hand-off (fills counted in the export).
export const colors = {
  bg: '#000000',
  bgFeed: '#061532',
  card: '#18172B',
  cardAlt: '#1E1D35',
  cardBorder: '#2A2945',
  cyan: '#64EDF7',
  cyanDeep: '#34E8F4',
  purple: '#CB64F7',
  purpleDeep: '#B934F4',
  teal: '#044449',
  gold: '#FACC15',
  text: '#F3F4F6',
  textSoft: '#D1D5DB',
  textMuted: '#C0BEDA',
  textFaint: '#9CA3AF',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displayMedium: 'PlayfairDisplay_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Poster cards on the home rails: 3-up on a 390pt screen, 2:3 ratio.
export const poster = { width: 112, height: 168 } as const;
