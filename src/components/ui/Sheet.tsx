import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View, Dimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design/ThemeProvider';

/**
 * Bottom sheet shell — DESIGN.md §17. Used by (sheets)/daily-checkin and
 * (sheets)/quick-log instead of native formSheet, so radius/handle/backdrop/motion
 * match the token spec identically on iOS and Android.
 */
export function Sheet({ onClose, children, maxHeightRatio = 0.9 }: { onClose: () => void; children: React.ReactNode; maxHeightRatio?: number }) {
  const { colors, tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: tokens.motion.sheetEnterDuration, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: tokens.motion.sheetEnterDuration, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: screenHeight, duration: 200, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          close();
        } else {
          Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Animated.View style={{ position: 'absolute', inset: 0, backgroundColor: colors.scrim, opacity: backdropOpacity }}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel="Kapat" />
      </Animated.View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          maxHeight: screenHeight * maxHeightRatio,
          backgroundColor: colors.surfaceRaised,
          borderTopLeftRadius: tokens.radius.lg,
          borderTopRightRadius: tokens.radius.lg,
          paddingBottom: insets.bottom + tokens.spacing['20'],
          transform: [{ translateY }],
          ...colors.shadowOverlay,
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: tokens.spacing['12'] }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong }} />
        </View>
        <View style={{ paddingHorizontal: tokens.spacing['20'], paddingTop: tokens.spacing['16'] }}>{children}</View>
      </Animated.View>
    </View>
  );
}
