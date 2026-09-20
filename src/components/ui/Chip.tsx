import React, { useEffect, useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

export type ChipTone = 'neutral' | 'success' | 'amber' | 'terracotta' | 'violet' | 'slateBlue';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: ChipTone;
  /** Compact chips are for read-only tags in lists; interactive chips keep the 44dp target. */
  compact?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}

/**
 * Pill chip (Plan §6.6: "çip tam yuvarlak", ≥44dp touch target).
 * Selected state = tonal fill; unselected = surface-secondary. A subtle scale
 * tick on select gives feedback without a full haptic per tap.
 */
export function Chip({ label, selected = false, onPress, tone = 'neutral', compact = false, disabled = false, accessibilityHint }: Props) {
  const { colors, tokens } = useTheme();
  const toneColor = tone === 'neutral' ? colors.indigo : (colors as any)[tone];
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: tokens.motion.chipSelect / 2, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: tokens.motion.chipSelect / 2, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  const handlePress = () => {
    if (!onPress || disabled) return;
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        disabled={!onPress || disabled}
        hitSlop={compact ? 4 : 2}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        style={{
          minHeight: compact ? 28 : tokens.touchTarget.chip,
          paddingHorizontal: compact ? tokens.spacing['12'] : tokens.spacing['16'],
          paddingVertical: compact ? tokens.spacing['4'] : tokens.spacing['8'],
          borderRadius: tokens.radius.pill,
          backgroundColor: selected ? toneColor : colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: selected ? toneColor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? tokens.opacity.disabled : 1,
        }}
      >
        <Text variant={compact ? 'caption' : 'label'} color={selected ? 'onAccent' : 'secondary'} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
