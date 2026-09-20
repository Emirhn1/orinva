import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, View } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

export function Skeleton({ width = '100%', height = 16, radius, style }: { width?: number | string; height?: number; radius?: number; style?: ViewStyle }) {
  const { colors, tokens } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 0.8, duration: tokens.motion.shimmerLoop / 2, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.5, duration: tokens.motion.shimmerLoop / 2, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius ?? tokens.radius.sm,
          backgroundColor: colors.surfaceSecondary,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: tokens.spacing['8'] }}>
      <Skeleton height={20} width="50%" />
      <Skeleton height={14} width="90%" />
      <Skeleton height={14} width="70%" />
    </View>
  );
}
