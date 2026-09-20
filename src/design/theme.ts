import { palette, radius, spacing, typography, iconSize, componentHeight, motion, opacity, shadow, touchTarget } from './tokens';

export type ThemeMode = 'light' | 'dark';

export interface SemanticColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  onAccent: string;

  indigo: string;
  success: string;
  successSoft: string;
  amber: string;
  amberSoft: string;
  terracotta: string;
  terracottaSoft: string;
  violet: string;
  violetSoft: string;
  slateBlue: string;
  slateBlueSoft: string;
  cyan: string;
  bronze: string;

  scrim: string;
  shadowSurface: object;
  shadowOverlay: object;

  /** Outcome semantics (Plan §6.6): resisted = success, delayed = slate blue, acted = amber. Never red. */
  outcomeResisted: string;
  outcomeResistedSoft: string;
  outcomeDelayed: string;
  outcomeDelayedSoft: string;
  outcomeActed: string;
  outcomeActedSoft: string;
}

function buildTheme(mode: ThemeMode): SemanticColors {
  const isDark = mode === 'dark';
  return {
    background: isDark ? palette.backgroundDark : palette.backgroundLight,
    surface: isDark ? palette.surfaceDark : palette.surfaceLight,
    surfaceSecondary: isDark ? palette.surfaceSecondaryDark : palette.surfaceSecondaryLight,
    surfaceRaised: isDark ? palette.surfaceRaisedDark : palette.surfaceLight,
    border: isDark ? palette.borderDark : palette.borderLight,
    borderStrong: isDark ? palette.borderStrongDark : palette.borderStrongLight,
    textPrimary: isDark ? palette.textPrimaryDark : palette.textPrimaryLight,
    textSecondary: isDark ? palette.textSecondaryDark : palette.textSecondaryLight,
    textTertiary: isDark ? palette.textTertiaryDark : palette.textTertiaryLight,
    onAccent: palette.white,

    indigo: palette.indigo500,
    success: isDark ? palette.successOnDark : palette.successBase,
    successSoft: isDark ? palette.successSoftDark : palette.successSoftLight,
    amber: isDark ? palette.amberOnDark : palette.amberBase,
    amberSoft: isDark ? palette.amberSoftDark : palette.amberSoftLight,
    terracotta: isDark ? palette.terracottaOnDark : palette.terracottaBase,
    terracottaSoft: isDark ? palette.terracottaSoftDark : palette.terracottaSoftLight,
    violet: isDark ? palette.violetOnDark : palette.violetBase,
    violetSoft: isDark ? palette.violetSoftDark : palette.violetSoftLight,
    slateBlue: isDark ? palette.slateBlueOnDark : palette.slateBlueBase,
    slateBlueSoft: isDark ? palette.slateBlueSoftDark : palette.slateBlueSoftLight,
    cyan: isDark ? palette.cyanOnDark : palette.cyanBase,
    bronze: isDark ? palette.bronzeOnDark : palette.bronzeBase,

    scrim: `rgba(9,12,19,${opacity.scrim})`,
    shadowSurface: isDark ? shadow.none : shadow.surfaceLight,
    shadowOverlay: isDark ? shadow.none : shadow.overlayLight,

    outcomeResisted: isDark ? palette.successOnDark : palette.successBase,
    outcomeResistedSoft: isDark ? palette.successSoftDark : palette.successSoftLight,
    outcomeDelayed: isDark ? palette.slateBlueOnDark : palette.slateBlueBase,
    outcomeDelayedSoft: isDark ? palette.slateBlueSoftDark : palette.slateBlueSoftLight,
    outcomeActed: isDark ? palette.amberOnDark : palette.amberBase,
    outcomeActedSoft: isDark ? palette.amberSoftDark : palette.amberSoftLight,
  };
}

export const themes: Record<ThemeMode, SemanticColors> = {
  light: buildTheme('light'),
  dark: buildTheme('dark'),
};

export const tokens = {
  spacing,
  radius,
  typography,
  iconSize,
  componentHeight,
  motion,
  opacity,
  touchTarget,
};

export type Tokens = typeof tokens;

import type { EventOutcome } from '@/data/types';

export function outcomeColors(colors: SemanticColors, outcome: EventOutcome): { fg: string; soft: string } {
  switch (outcome) {
    case 'resisted':
      return { fg: colors.outcomeResisted, soft: colors.outcomeResistedSoft };
    case 'delayed':
      return { fg: colors.outcomeDelayed, soft: colors.outcomeDelayedSoft };
    case 'acted':
      return { fg: colors.outcomeActed, soft: colors.outcomeActedSoft };
    default:
      return { fg: colors.textSecondary, soft: colors.surfaceSecondary };
  }
}
