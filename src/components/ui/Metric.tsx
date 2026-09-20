import React from 'react';
import { View } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  value: string;
  label: string;
  size?: 'large' | 'small';
}

export function Metric({ value, label, size = 'small' }: Props) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text variant={size === 'large' ? 'statLarge' : 'statSmall'} tabular>
        {value}
      </Text>
      <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
        {label}
      </Text>
    </View>
  );
}
