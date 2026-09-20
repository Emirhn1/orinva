import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '@/design/ThemeProvider';

/**
 * Single icon set wrapper (DESIGN.md §11 — Iconography).
 * Always route icon usage through <Icon /> so size/stroke stays consistent
 * app-wide instead of every screen picking its own vector-icon family.
 */

export type IconName =
  | 'home' | 'compass' | 'book-open' | 'user' | 'plus' | 'check' | 'x'
  | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'bell' | 'settings'
  | 'shield' | 'lock' | 'download' | 'trash-2' | 'edit-3' | 'mic'
  | 'wind' | 'clock' | 'zap' | 'heart' | 'droplet' | 'moon' | 'sun'
  | 'trending-up' | 'calendar' | 'bar-chart-2' | 'award' | 'bookmark'
  | 'message-circle' | 'search' | 'sliders' | 'alert-circle' | 'info'
  | 'arrow-right' | 'arrow-left' | 'pause' | 'play' | 'more-horizontal'
  | 'star' | 'dollar-sign' | 'activity' | 'feather' | 'phone-off'
  | 'refresh-cw' | 'send' | 'volume-2' | 'flag' | 'grid';

export function Icon({
  name,
  size = 24,
  color,
  strokeWidth = 1.6,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { colors } = useTheme();
  return <Feather name={name as any} size={size} color={color ?? colors.textSecondary} />;
}
