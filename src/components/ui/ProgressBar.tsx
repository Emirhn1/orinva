import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  progress: number; // 0..1
  color?: string;
}

export function ProgressBar({ progress, color }: Props) {
  const { colors, tokens } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height: 4, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceSecondary, overflow: 'hidden' }}>
      <View style={{ width: `${clamped * 100}%`, height: '100%', borderRadius: tokens.radius.pill, backgroundColor: color ?? colors.indigo }} />
    </View>
  );
}
