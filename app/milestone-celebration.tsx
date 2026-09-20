import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Sheet, Text, Button, Surface } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { HEALTH_TIMELINE_NICOTINE } from '@/content/library';

/** DESIGN.md §26 — the one place celebration is allowed, and even here it's adult and quiet. */
export default function MilestoneCelebration() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const pendingMilestone = useAppStore((s) => s.pendingMilestone);
  const behaviors = useAppStore((s) => s.behaviors);
  const dismissPendingMilestone = useAppStore((s) => s.dismissPendingMilestone);
  const acknowledgeMilestone = useAppStore((s) => s.acknowledgeMilestone);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: tokens.motion.milestoneDuration, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    if (pendingMilestone) acknowledgeMilestone(pendingMilestone.id);
    dismissPendingMilestone();
    router.back();
  };

  if (!pendingMilestone) return null;

  const behavior = behaviors.find((b) => b.id === pendingMilestone.behaviorId);
  const health = behavior?.category === 'nicotine' ? HEALTH_TIMELINE_NICOTINE.filter((h) => h.hours <= pendingMilestone.thresholdHours).pop() : null;

  return (
    <Sheet onClose={close} hideClose>
      <View style={{ alignItems: 'center', paddingVertical: tokens.spacing['16'] }}>
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <Surface radius="pill" style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.bronze }}>
            <Icon name="award" size={32} color={colors.bronze} />
          </Surface>
        </Animated.View>
        <Text variant="title" style={{ marginTop: tokens.spacing['20'] }}>
          {pendingMilestone.label} oldu
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], textAlign: 'center' }}>
          {behavior?.name ? `${behavior.name}. ` : ''}Bu küçük değil.
        </Text>
        {health ? (
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['20'], width: '100%' }}>
            <Text variant="caption" color="tertiary">
              {health.label}
            </Text>
            <Text variant="body" style={{ marginTop: tokens.spacing['4'] }}>
              {health.text}
            </Text>
          </Surface>
        ) : null}
        <View style={{ marginTop: tokens.spacing['24'], width: '100%' }}>
          <Button label="Devam et" onPress={close} />
        </View>
      </View>
    </Sheet>
  );
}
