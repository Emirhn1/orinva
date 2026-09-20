import React from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';
import { MOOD_CHIPS, MOOD_UNSURE } from '@/content/chips';

interface Props {
  value: string | null;
  onChange: (mood: string | null) => void;
}

/**
 * DESIGN.md §24 — 5-point word-labelled scale in one row, plus (H16) a separate
 * neutral "Emin değilim" option so the scale stays a scale.
 * Stored value is the chip id ("tense", "calm", …).
 */
export function MoodSelector({ value, onChange }: Props) {
  const { colors, tokens } = useTheme();

  const pick = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    onChange(value === id ? null : id);
  };

  return (
    <View style={{ gap: tokens.spacing['8'] }}>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['4'] }}>
        {MOOD_CHIPS.map((mood) => {
          const selected = value === mood.id;
          return (
            <Pressable
              key={mood.id}
              onPress={() => pick(mood.id)}
              accessibilityRole="button"
              accessibilityLabel={mood.label}
              accessibilityState={{ selected }}
              style={{
                flex: 1,
                minHeight: 44,
                paddingHorizontal: tokens.spacing['4'],
                borderRadius: tokens.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? colors.slateBlue : colors.surfaceSecondary,
              }}
            >
              <Text variant="caption" color={selected ? 'onAccent' : 'secondary'} numberOfLines={1} adjustsFontSizeToFit>
                {mood.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={() => pick(MOOD_UNSURE.id)}
        accessibilityRole="button"
        accessibilityLabel={MOOD_UNSURE.label}
        accessibilityState={{ selected: value === MOOD_UNSURE.id }}
        style={{
          alignSelf: 'flex-start',
          minHeight: 36,
          paddingHorizontal: tokens.spacing['12'],
          borderRadius: tokens.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: value === MOOD_UNSURE.id ? colors.textSecondary : colors.border,
          backgroundColor: 'transparent',
        }}
      >
        <Text variant="caption" color="secondary">
          {MOOD_UNSURE.label}
        </Text>
      </Pressable>
    </View>
  );
}
