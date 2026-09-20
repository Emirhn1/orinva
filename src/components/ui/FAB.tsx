import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/icons';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';
import { useFabStore } from '@/store/useFabStore';

/**
 * Global "Zor An" shortcut — DESIGN.md §31 craving-help CTA, 60px, largest touch
 * target in the app. Rendered once at the tab-navigator level.
 *
 * H1: it collapses to a circular icon while the user scrolls down so it never
 * hides the last rows of a list; scrolling up (or stopping) expands it again.
 */
export function EmergencyFAB({ onPress, bottomOffset }: { onPress: () => void; bottomOffset: number }) {
  const { colors, tokens } = useTheme();
  const collapsed = useFabStore((s) => s.collapsed);
  const scale = useRef(new Animated.Value(1)).current;
  const expand = useRef(new Animated.Value(1)).current; // 1 = full width, 0 = circle

  useEffect(() => {
    Animated.timing(expand, { toValue: collapsed ? 0 : 1, duration: tokens.motion.fabCollapse, useNativeDriver: false }).start();
  }, [collapsed]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  const { width: screenWidth } = useWindowDimensions();
  const size = tokens.componentHeight.cravingHelpCta;
  const fullWidth = Math.min(screenWidth - tokens.spacing['20'] * 2, 520);
  const width = expand.interpolate({ inputRange: [0, 1], outputRange: [size, fullWidth] });
  const labelOpacity = expand.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });
  const radius = expand.interpolate({ inputRange: [0, 1], outputRange: [size / 2, tokens.radius.lg] });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: tokens.spacing['20'],
        bottom: bottomOffset,
        alignItems: 'flex-end',
        transform: [{ scale }],
      }}
    >
      <Animated.View style={{ width, maxWidth: '100%' }}>
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
              borderRadius: radius,
              backgroundColor: colors.indigo,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing['8'],
              paddingHorizontal: collapsed ? 0 : tokens.spacing['20'],
              overflow: 'hidden',
              ...colors.shadowOverlay,
            }}
          >
            <Icon name="wind" size={22} color={colors.onAccent} />
            {!collapsed ? (
              <Animated.View style={{ opacity: labelOpacity }}>
                <Text variant="bodyLarge" color="onAccent" style={{ fontWeight: '600' }} numberOfLines={1}>
                  Şu an zorlanıyorum
                </Text>
              </Animated.View>
            ) : null}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
