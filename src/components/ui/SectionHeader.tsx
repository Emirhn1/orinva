import React from 'react';
import { View } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: Props) {
  const { tokens, colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing['12'] }}>
      <Text variant="title">{title}</Text>
      {action ? (
        <Text variant="label" color="indigo" onPress={action.onPress}>
          {action.label}
        </Text>
      ) : null}
    </View>
  );
}
