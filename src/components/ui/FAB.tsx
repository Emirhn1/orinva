import React, { useRef } from 'react';
import { Pressable, Animated, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/icons';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

/**
 * Global "Zor An" shortcut — DESIGN.md §31 craving-help CTA, 60px, largest touch
 * target in the app. Rendered once at the tab-navigator level.
 *
 * Sabit kalır; kaydırma sırasında boyutu veya konumu değişmez.
 */
export function EmergencyFAB({ onPress, bottomOffset }: { onPress: () => void; bottomOffset: number }) {
  const { colors, tokens } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  const { width: screenWidth } = useWindowDimensions();
  const size = tokens.componentHeight.cravingHelpCta;
  const fullWidth = Math.min(screenWidth - tokens.spacing['20'] * 2, 520);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: tokens.spacing['20'],
        bottom: bottomOffset,
        alignItems: 'flex-end',
        zIndex: 20,
        elevation: 20,
        transform: [{ scale }],
      }}
    >
      <Animated.View style={{ width: fullWidth, maxWidth: '100%' }}>
        <Pressable
          onPress={handlePress}
          onPressIn={() => Animated.timing(scale, { toValue: tokens.motion.pressScale, duration: tokens.motion.pressDuration, useNativeDriver: true }).start()}
          onPressOut={() => Animated.timing(scale, { toValue: 1, duration: tokens.motion.pressDuration, useNativeDriver: true }).start()}
          accessibilityRole="button"
          accessibilityLabel="Şu an zorlanıyorum"
          style={{ height: size }}
        >
          <Animated.View
            style={{
              height: size,
              borderRadius: tokens.radius.lg,
              backgroundColor: colors.indigo,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing['8'],
              paddingHorizontal: tokens.spacing['20'],
              overflow: 'hidden',
              ...colors.shadowOverlay,
            }}
          >
            <Icon name="wind" size={22} color={colors.onAccent} />
            <Text variant="bodyLarge" color="onAccent" style={{ fontWeight: '600' }} numberOfLines={1}>
              Şu an zorlanıyorum
            </Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
