import React, { useRef } from 'react';
import { Pressable, Animated, GestureResponderEvent } from 'react-native';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  name: IconName;
  onPress?: (e: GestureResponderEvent) => void;
  size?: number;
  color?: string;
  variant?: 'plain' | 'surface';
  accessibilityLabel: string;
}

export function IconButton({ name, onPress, size = 24, color, variant = 'plain', accessibilityLabel }: Props) {
  const { colors, tokens } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.timing(scale, { toValue: tokens.motion.pressScale, duration: tokens.motion.pressDuration, useNativeDriver: true }).start()}
        onPressOut={() => Animated.timing(scale, { toValue: 1, duration: tokens.motion.pressDuration, useNativeDriver: true }).start()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{
          width: 44,
          height: 44,
          borderRadius: tokens.radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'surface' ? colors.surfaceSecondary : 'transparent',
        }}
      >
        <Icon name={name} size={size} color={color ?? colors.textPrimary} />
      </Pressable>
    </Animated.View>
  );
}
