import React, { useRef } from 'react';
import { Pressable, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/icons';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

/**
 * Global "Zor An" shortcut — DESIGN.md §31 craving-help CTA, 60px, largest touch
 * target in the app. Rendered once at the tab-navigator level (see app/(tabs)/_layout.tsx),
 * not per-screen.
 */
export function EmergencyFAB({ onPress, bottomOffset }: { onPress: () => void; bottomOffset: number }) {
  const { colors, tokens } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: tokens.spacing['20'],
        right: tokens.spacing['20'],
        bottom: bottomOffset,
        transform: [{ scale }],
      }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => Animated.timing(scale, { toValue: tokens.motion.pressScale, duration: tokens.motion.pressDuration, useNativeDriver: true }).start()}
        onPressOut={() => Animated.timing(scale, { toValue: 1, duration: tokens.motion.pressDuration, useNativeDriver: true }).start()}
        accessibilityRole="button"
        accessibilityLabel="Şu an zorlanıyorum"
        style={{
          height: tokens.componentHeight.cravingHelpCta,
          borderRadius: tokens.radius.lg,
          backgroundColor: colors.indigo,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing['8'],
          ...colors.shadowOverlay,
        }}
      >
        <Icon name="wind" size={22} color={colors.onAccent} />
        <Text variant="bodyLarge" color="onAccent" style={{ fontWeight: '600' }}>
          Şu an zorlanıyorum
        </Text>
      </Pressable>
    </Animated.View>
  );
}
