/**
 * Raw design tokens transcribed 1:1 from DESIGN.md.
 * Nothing in the app should hardcode a color/space/radius value —
 * it should reference a token from here (usually via useTheme()).
 */

export const palette = {
  indigo50: '#EEF1FA',
  indigo100: '#DCE2F5',
  indigo200: '#B9C5EB',
  indigo300: '#93A4DD',
  indigo400: '#6E82CC',
  indigo500: '#4E5FB8',
  indigo600: '#3E4C99',
  indigo700: '#333F7D',
  indigo800: '#293261',
  indigo900: '#1C2247',

  petrol950: '#080B12',
  petrol900: '#0B0F19',
  petrol800: '#111726',
  petrol700: '#182034',
  petrol600: '#212B43',
  petrol500: '#2C3854',
  petrol100: '#EEF0F4',
  petrol50: '#F5F6F9',

  backgroundLight: '#F4F5F9',
  surfaceLight: '#FFFFFF',
  surfaceSecondaryLight: '#EAEDF3',
  borderLight: '#DFE2EA',
  borderStrongLight: '#C7CCD9',
  textPrimaryLight: '#12172A',
  textSecondaryLight: '#5A6178',
  textTertiaryLight: '#667088', // 4.9:1 on #FFFFFF (was #8890A3 → 3.3:1, failed AA)

  backgroundDark: '#090C13',
  surfaceDark: '#121726',
  surfaceSecondaryDark: '#1A2032',
  surfaceRaisedDark: '#1D2438',
  borderDark: '#262E44',
  borderStrongDark: '#38415C',
  textPrimaryDark: '#F0F2F8',
  textSecondaryDark: '#9AA2BC',
  textTertiaryDark: '#8A94B0', // 5.4:1 on #121726 (was #6B7591 → 3.6:1, failed AA)

  successBase: '#22A57C',
  successOnDark: '#3FCC9C',
  successSoftLight: '#E1F5EC',
  successSoftDark: '#132A22',

  amberBase: '#C6841F',
  amberOnDark: '#E3A54B',
  amberSoftLight: '#FBEEDA',
  amberSoftDark: '#2B2210',

  terracottaBase: '#BC5744',
  terracottaOnDark: '#DD8570',
  terracottaSoftLight: '#F8E7E2',
  terracottaSoftDark: '#2A1712',

  violetBase: '#7566D6',
  violetOnDark: '#9C8FEE',
  violetSoftLight: '#EEEBFB',
  violetSoftDark: '#1C1830',

  slateBlueBase: '#54809E',
  slateBlueOnDark: '#7FAAC6',
  slateBlueSoftLight: '#E7F0F5',
  slateBlueSoftDark: '#12222B',

  cyanBase: '#2B96A0',
  cyanOnDark: '#52C2CC',

  bronzeBase: '#B98A4D',
  bronzeOnDark: '#D6AC76',

  white: '#FFFFFF',
} as const;

export const spacing = {
  '2': 2,
  '4': 4,
  '8': 8,
  '12': 12,
  '16': 16,
  '20': 20,
  '24': 24,
  '32': 32,
  '40': 40,
  '48': 48,
  '64': 64,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '700' as const, lineHeight: 39, letterSpacing: -0.6 },
  headline: { fontSize: 28, fontWeight: '700' as const, lineHeight: 33, letterSpacing: -0.4 },
  title: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25, letterSpacing: -0.2 },
  bodyLarge: { fontSize: 17, fontWeight: '400' as const, lineHeight: 27, letterSpacing: 0 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 23, letterSpacing: 0 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.07 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 17, letterSpacing: 0.24 },
  statLarge: { fontSize: 40, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.8 },
  statSmall: { fontSize: 22, fontWeight: '700' as const, lineHeight: 24, letterSpacing: -0.2 },
} as const;

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  hero: 48,
} as const;

export const touchTarget = {
  min: 44,
  chip: 44,
};

export const componentHeight = {
  /** Space screens reserve at the bottom so content clears the floating "Zor An" CTA (H1). */
  fabClearance: 60 + 12 + 24,
  buttonPrimary: 52,
  buttonSecondary: 48,
  buttonGhost: 44,
  buttonCriticalHeight: 48,
  cravingHelpCta: 60,
  input: 52,
  bottomNav: 64,
  topNav: 56,
  toast: 48,
};

export const motion = {
  pressScale: 0.97,
  pressDuration: 90,
  toastDuration: 180,
  sheetEnterDuration: 260,
  modalEnterDuration: 200,
  screenTransitionDuration: 280,
  milestoneDuration: 400,
  shimmerLoop: 1200,
  breathingCycle: 1000,
  toastAutoDismiss: 3200,
  undoWindow: 5000,
  fabCollapse: 180,
  chipSelect: 120,
};

export const opacity = {
  disabled: 0.4,
  pressedOverlayLight: 0.06,
  pressedOverlayDark: 0.12,
  scrim: 0.55,
};

export const shadow = {
  surfaceLight: {
    shadowColor: '#12172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  overlayLight: {
    shadowColor: '#12172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};
