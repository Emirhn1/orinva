import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

const LEVELS = ['Hafif', 'Belirgin', 'Güçlü', 'Çok güçlü', 'Bunaltıcı'];

interface Props {
  value: number | null; // 1..5
  onChange: (level: number) => void;
}

export function CravingSelector({ value, onChange }: Props) {
  const { colors, tokens } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: tokens.spacing['4'] }}>
      {LEVELS.map((label, i) => {
        const level = i + 1;
        const selected = value === level;
        return (
          <Pressable
            key={label}
            onPress={() => onChange(level)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: tokens.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: tokens.spacing['4'],
              backgroundColor: selected ? colors.amber : colors.surfaceSecondary,
            }}
          >
            <Text variant="caption" color={selected ? 'onAccent' : 'secondary'} numberOfLines={1} adjustsFontSizeToFit>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
