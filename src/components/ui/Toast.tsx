import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/icons';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';
import { useToastStore } from '@/store/useToastStore';

/**
 * Toast host — DESIGN.md §19. Rendered once in the root layout, above every
 * stack/modal. `surface-raised` + 1px border, the icon carries the semantic
 * color, text stays primary. Swipe down or tap to dismiss; an optional
 * action ("Geri al") sits on the right.
 */
export function ToastHost() {
  const { colors, tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) return;
    translateY.setValue(80);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: tokens.motion.toastDuration, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: tokens.motion.toastDuration, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => hide(), current.durationMs ?? tokens.motion.toastAutoDismiss);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 80, duration: tokens.motion.toastDuration, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: tokens.motion.toastDuration, useNativeDriver: true }),
    ]).start(() => dismiss());
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 30) hide();
        else Animated.timing(translateY, { toValue: 0, duration: 120, useNativeDriver: true }).start();
      },
    })
  ).current;

  if (!current) return null;

  const iconColor =
    current.tone === 'success' ? colors.success : current.tone === 'terracotta' ? colors.terracotta : colors.indigo;

  // Sits above the tab bar + floating CTA when they're present; on modal-only
  // screens the extra space is harmless.
  const bottom = insets.bottom + tokens.componentHeight.bottomNav + tokens.componentHeight.fabClearance - tokens.spacing['8'];

  return (
    <Animated.View
      {...pan.panHandlers}
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: tokens.spacing['16'],
        right: tokens.spacing['16'],
        bottom,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <Pressable
        onPress={hide}
        accessibilityRole="alert"
        style={{
          minHeight: tokens.componentHeight.toast,
          borderRadius: tokens.radius.md,
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: tokens.spacing['16'],
          paddingVertical: tokens.spacing['12'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing['12'],
          ...colors.shadowOverlay,
        }}
      >
        <Icon name={current.icon ?? 'check'} size={20} color={iconColor} />
        <Text variant="body" style={{ flex: 1 }} numberOfLines={2}>
          {current.message}
        </Text>
        {current.actionLabel && current.onAction ? (
          <Pressable
            onPress={() => {
              current.onAction?.();
              hide();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={current.actionLabel}
            style={{ paddingHorizontal: tokens.spacing['8'], paddingVertical: tokens.spacing['4'] }}
          >
            <Text variant="label" color="indigo">
              {current.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </Pressable>
      <View />
    </Animated.View>
  );
}
