import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';
import { outcomeColors } from '@/design/theme';
import { EventOutcome } from '@/data/types';

/** Tonal badge for an event outcome — colour + word, never colour alone (DESIGN.md §39). */
export function OutcomeBadge({ outcome, resistedLabel = 'Direndim', actedLabel = 'Yaptım' }: { outcome: EventOutcome; resistedLabel?: string; actedLabel?: string }) {
  const { colors, tokens } = useTheme();
  const { fg, soft } = outcomeColors(colors, outcome);
  const label = outcome === 'resisted' ? resistedLabel : outcome === 'delayed' ? 'Erteledim' : outcome === 'acted' ? actedLabel : outcome === 'unsure' ? 'Emin değilim' : 'Sonucu ekle';
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
        {label}
      </Text>
    </View>
  );
}

/**
 * Three-way outcome picker used by quick log / event edit. Selecting "Yaptım"
 * uses the neutral amber — the moment is acknowledged, not punished (§35).
 */
export function OutcomePicker({
  value,
  onChange,
  includeUnsure = false,
  resistedLabel = 'Direndim',
  actedLabel = 'Yaptım',
}: {
  value: EventOutcome;
  onChange: (o: EventOutcome) => void;
  includeUnsure?: boolean;
  resistedLabel?: string;
  actedLabel?: string;
}) {
  const { colors, tokens } = useTheme();
  const baseOptions: { id: Exclude<EventOutcome, null>; label: string }[] = [
    { id: 'resisted', label: resistedLabel },
    { id: 'delayed', label: 'Erteledim' },
    { id: 'acted', label: actedLabel },
  ];
  const options = includeUnsure ? [...baseOptions, { id: 'unsure' as const, label: 'Emin değilim' }] : baseOptions;
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
              minHeight: tokens.touchTarget.min,
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
