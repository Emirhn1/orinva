import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

const MOODS = ['Çok gergin', 'Gergin', 'Nötr', 'Sakin', 'Çok sakin'];
const UNSURE = 'Emin değilim';

interface Props {
  value: string | null;
  onChange: (mood: string) => void;
}

export function MoodSelector({ value, onChange }: Props) {
  const { colors, tokens } = useTheme();
  const options = [...MOODS, UNSURE];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'] }}>
      {options.map((mood) => {
        const selected = value === mood;
        return (
          <Pressable
            key={mood}
            onPress={() => onChange(mood)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              minHeight: 44,
              minWidth: 44,
              paddingHorizontal: tokens.spacing['12'],
              borderRadius: tokens.radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.slateBlue : colors.surfaceSecondary,
            }}
          >
            <Text variant="label" color={selected ? 'onAccent' : 'secondary'}>
              {mood}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
