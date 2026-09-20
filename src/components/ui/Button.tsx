import React, { useRef } from 'react';
import { Pressable, Animated, ActivityIndicator, GestureResponderEvent, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'critical' | 'cravingHelp';

interface Props {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  haptic?: 'light' | 'medium' | 'none';
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  haptic = 'light',
  style,
}: Props) {
  const { colors, tokens } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const heights: Record<ButtonVariant, number> = {
    primary: tokens.componentHeight.buttonPrimary,
    secondary: tokens.componentHeight.buttonSecondary,
    ghost: tokens.componentHeight.buttonGhost,
    critical: tokens.componentHeight.buttonCriticalHeight,
    cravingHelp: tokens.componentHeight.cravingHelpCta,
  };

  const bg: Record<ButtonVariant, string> = {
    primary: colors.indigo,
    secondary: 'transparent',
    ghost: 'transparent',
    critical: 'transparent',
    cravingHelp: colors.indigo,
  };

  const textColor: Record<ButtonVariant, any> = {
    primary: 'onAccent',
    secondary: 'primary',
    ghost: 'indigo',
    critical: 'terracotta',
    cravingHelp: 'onAccent',
  };

  const border: Record<ButtonVariant, { width: number; color: string }> = {
    primary: { width: 0, color: 'transparent' },
    secondary: { width: 1, color: colors.borderStrong },
    ghost: { width: 0, color: 'transparent' },
    critical: { width: 1, color: colors.terracotta },
    cravingHelp: { width: 0, color: 'transparent' },
  };

  const radiusKey = variant === 'cravingHelp' ? 'lg' : variant === 'ghost' ? 'sm' : 'md';

  const pressIn = () => Animated.timing(scale, { toValue: tokens.motion.pressScale, duration: tokens.motion.pressDuration, useNativeDriver: true }).start();
  const pressOut = () => Animated.timing(scale, { toValue: 1, duration: tokens.motion.pressDuration, useNativeDriver: true }).start();

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (haptic !== 'none') {
      Haptics.impactAsync(haptic === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress(e);
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: fullWidth ? '100%' : undefined, opacity: disabled ? tokens.opacity.disabled : 1 }}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled || loading}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          height: heights[variant],
          minHeight: 44,
          borderRadius: tokens.radius[radiusKey],
          backgroundColor: bg[variant],
          borderWidth: border[variant].width,
          borderColor: border[variant].color,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          paddingHorizontal: tokens.spacing['20'],
          ...style,
        }}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' || variant === 'cravingHelp' ? colors.onAccent : colors.indigo} />
        ) : (
          <Text variant={variant === 'cravingHelp' ? 'bodyLarge' : 'label'} color={textColor[variant]} style={variant === 'cravingHelp' ? { fontWeight: '600' } : undefined}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
