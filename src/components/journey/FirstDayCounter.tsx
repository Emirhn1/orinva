import React from 'react';
import { View } from 'react-native';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Text } from '@/components/ui/Typography';
import { useTheme } from '@/design/ThemeProvider';
import { firstDayState } from '@/utils/firstDay';

export function FirstDayCounter({ totalMinutes, color, size = 96 }: { totalMinutes: number; color: string; size?: number }) {
  const { tokens } = useTheme();
  const state = firstDayState(totalMinutes);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['16'] }}>
      <ProgressRing progress={state.progress} size={size} color={color}>
        <Text variant="statSmall" tabular>{state.value}</Text>
        <Text variant="caption" color="tertiary">{state.unit}</Text>
      </ProgressRing>
      <View style={{ flex: 1 }}>
        <Text variant="label">İlk hedef: 24 saat</Text>
        <Text variant="body" color={state.complete ? 'success' : 'secondary'} tabular style={{ marginTop: tokens.spacing['4'] }}>
          {state.remaining}
        </Text>
      </View>
    </View>
  );
}
