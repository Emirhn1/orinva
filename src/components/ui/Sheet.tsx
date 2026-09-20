import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View, Dimensions, PanResponder, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design/ThemeProvider';
import { Text } from './Typography';
import { IconButton } from './IconButton';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  maxHeightRatio?: number;
  /** H9 — every sheet has the same header: handle, left-aligned title, X on the right. */
  title?: string;
  subtitle?: string;
  /** Hide the X when a sheet must be answered with its own buttons. */
  hideClose?: boolean;
  scroll?: boolean;
}

/**
 * Bottom sheet shell — DESIGN.md §17. One consistent grammar for every sheet:
 * drag handle → title row (title left, close right) → content → actions.
 */
export function Sheet({ onClose, children, maxHeightRatio = 0.92, title, subtitle, hideClose = false, scroll = true }: Props) {
  const { colors, tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: tokens.motion.sheetEnterDuration, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: tokens.motion.sheetEnterDuration, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
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

  const content = (
    <View style={{ paddingHorizontal: tokens.spacing['20'], paddingTop: title ? 0 : tokens.spacing['16'] }}>{children}</View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Animated.View style={{ position: 'absolute', inset: 0, backgroundColor: colors.scrim, opacity: backdropOpacity }}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel="Kapat" />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none">
        <Animated.View
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
          <View {...panResponder.panHandlers}>
            <View style={{ alignItems: 'center', paddingTop: tokens.spacing['12'] }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong }} />
            </View>
            {title ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  paddingHorizontal: tokens.spacing['20'],
                  paddingTop: tokens.spacing['12'],
                  paddingBottom: tokens.spacing['12'],
                }}
              >
                <View style={{ flex: 1, paddingRight: tokens.spacing['12'] }}>
                  <Text variant="title">{title}</Text>
                  {subtitle ? (
                    <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
                {!hideClose ? <IconButton name="x" onPress={close} accessibilityLabel="Kapat" /> : null}
              </View>
            ) : null}
          </View>
          {scroll ? (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
              {content}
            </ScrollView>
          ) : (
            content
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

/** Standard bottom action row for sheets: primary on the right, secondary/ghost on the left. */
export function SheetActions({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();
  return <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['20'] }}>{children}</View>;
}
