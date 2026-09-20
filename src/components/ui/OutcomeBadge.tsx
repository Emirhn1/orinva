import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';
import { outcomeColors } from '@/design/theme';
import { EventOutcome } from '@/data/types';
import { outcomeLabel } from '@/utils/journey';

/** Tonal badge for an event outcome — colour + word, never colour alone (DESIGN.md §39). */
export function OutcomeBadge({ outcome }: { outcome: EventOutcome }) {
  const { colors, tokens } = useTheme();
  const { fg, soft } = outcomeColors(colors, outcome);
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: tokens.spacing['8'],
        paddingVertical: tokens.spacing['4'],
        borderRadius: tokens.radius.pill,
        backgroundColor: soft,
        borderWidth: outcome ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Text variant="caption" style={{ color: fg }}>
        {outcomeLabel(outcome)}
      </Text>
    </View>
  );
}

const OPTIONS: { id: Exclude<EventOutcome, null>; label: string }[] = [
  { id: 'resisted', label: 'Direndim' },
  { id: 'delayed', label: 'Erteledim' },
  { id: 'acted', label: 'Yaptım' },
];

/**
 * Three-way outcome picker used by quick log / event edit. Selecting "Yaptım"
 * uses the neutral amber — the moment is acknowledged, not punished (§35).
 */
export function OutcomePicker({ value, onChange, includeUnsure = false }: { value: EventOutcome; onChange: (o: EventOutcome) => void; includeUnsure?: boolean }) {
  const { colors, tokens } = useTheme();
  const options = includeUnsure ? [...OPTIONS, { id: 'unsure' as const, label: 'Emin değilim' }] : OPTIONS;
  return (
    <View style={{ flexDirection: 'row', gap: tokens.spacing['8'], flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const selected = value === opt.id;
        const { fg, soft } = outcomeColors(colors, opt.id);
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(selected ? null : opt.id)}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected }}
            style={{
              flexGrow: 1,
              minHeight: 44,
              paddingHorizontal: tokens.spacing['12'],
              borderRadius: tokens.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? fg : soft,
              borderWidth: 1,
              borderColor: selected ? fg : 'transparent',
            }}
          >
            <Text variant="label" style={{ color: selected ? colors.onAccent : fg }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
