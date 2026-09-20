import React from 'react';
import { Pressable } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'neutral' | 'success' | 'amber' | 'terracotta' | 'violet' | 'slateBlue';
}

export function Chip({ label, selected = false, onPress, tone = 'neutral' }: Props) {
  const { colors, tokens } = useTheme();
  const toneColor = tone === 'neutral' ? colors.indigo : (colors as any)[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={4}
      style={{
        minHeight: 32,
        paddingHorizontal: tokens.spacing['12'],
        paddingVertical: tokens.spacing['4'],
        borderRadius: tokens.radius.xs,
        backgroundColor: selected ? toneColor : colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="caption" color={selected ? 'onAccent' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
}
