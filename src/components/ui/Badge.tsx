import React from 'react';
import { View } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  label: string;
  tone?: 'success' | 'amber' | 'terracotta' | 'violet' | 'slateBlue' | 'neutral';
}

export function Badge({ label, tone = 'neutral' }: Props) {
  const { colors, tokens } = useTheme();
  const soft =
    tone === 'success' ? colors.successSoft :
    tone === 'amber' ? colors.amberSoft :
    tone === 'terracotta' ? colors.terracottaSoft :
    tone === 'violet' ? colors.violetSoft :
    tone === 'slateBlue' ? colors.slateBlueSoft :
    colors.surfaceSecondary;
  const fg = tone === 'neutral' ? colors.textSecondary : (colors as any)[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: tokens.spacing['8'],
        paddingVertical: tokens.spacing['4'],
        borderRadius: tokens.radius.xs,
        backgroundColor: soft,
      }}
    >
      <Text variant="caption" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
