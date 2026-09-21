import React, { useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ModalShell, Text, Button } from '@/components/ui';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAppStore } from '@/store/useAppStore';
import { WHY_CHIPS, PLAN_CHIPS } from '@/content/chips';
import { usageKey } from '@/utils/chips';
import { behaviorVerbsFor } from '@/content/behaviors';
import { toast } from '@/store/useToastStore';

export default function OnboardingDemo() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const draft = useOnboardingStore();
  const resetDraft = useOnboardingStore((s) => s.reset);
  const addBehavior = useAppStore((s) => s.addBehavior);
  const addReason = useAppStore((s) => s.addReason);
  const logEvent = useAppStore((s) => s.logEvent);
  const closeEvent = useAppStore((s) => s.closeEvent);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [tapped, setTapped] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const pop = useRef(new Animated.Value(1)).current;
  const verbs = behaviorVerbsFor(draft.category);

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTapped(true);
    Animated.sequence([
      Animated.timing(pop, { toValue: 1.12, duration: 120, useNativeDriver: true }),
      Animated.timing(pop, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  const finish = () => {
    if (finishing || !draft.category || !draft.goalMode) return;
    setFinishing(true);
    const planText = resolveChipLabel(PLAN_CHIPS, draft.planChip) ?? undefined;

    let behavior;
    try {
      behavior = addBehavior({
        name: draft.nickname.trim() || 'Davranışım',
        category: draft.category,
        verbDid: draft.category === 'custom' ? draft.verbDid.trim() || 'Yaptım' : undefined,
        color: draft.behaviorColor,
        icon: draft.behaviorIcon,
        goalMode: draft.goalMode,
        unit: 'event',
        planAlternative: planText,
      });
    } catch (error) {
      // Already at the 5 active-behavior limit (e.g. onboarding re-entered with
      // existing data) — don't crash the app over a demo step; just skip adding
      // a redundant behavior and let the user land on what they already have.
      if (error instanceof Error && error.message === 'ACTIVE_BEHAVIOR_LIMIT') {
        toast.show({ message: 'Zaten beş aktif davranışın var — bunu atladık.', icon: 'info' });
        completeOnboarding();
        resetDraft();
        router.replace('/(tabs)/today');
        return;
      }
      throw error;
    }

    for (const id of draft.whyChips) {
      const label = resolveChipLabel(WHY_CHIPS, id);
      if (label) addReason(behavior.id, 'reason', label);
    }
    bumpChipUsage([...draft.whyChips.map((id) => usageKey('why', id)), ...(draft.planChip ? [usageKey('plan', draft.planChip)] : [])]);
    if (tapped) {
      const event = logEvent({ behaviorId: behavior.id, source: 'onboarding' });
      closeEvent(event.id, 'resisted');
      toast.show({ message: 'Deneme kaydı eklendi', tone: 'success', actionLabel: 'Geri al', durationMs: tokens.motion.undoWindow, onAction: () => removeEvent(event.id) });
    }
    completeOnboarding();
    resetDraft();
    router.replace('/(tabs)/today');
  };

  return (
    <ModalShell progress={5 / 5}>
      <View style={{ alignItems: 'center' }}>
        <Text variant="headline" style={{ textAlign: 'center' }}>
          Şimdi gerçekten dene
        </Text>
        <Text variant="body" color="secondary" style={{ textAlign: 'center', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['40'] }}>
          Zor anlarda kullanacağın butonun aynısı. İstersen şimdi bir kez dene, istersen atla.
        </Text>

        <Animated.View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: tapped ? colors.successSoft : colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing['32'],
            transform: [{ scale: pop }],
          }}
        >
          <Icon name={tapped ? 'check' : 'wind'} size={40} color={tapped ? colors.success : colors.indigo} />
        </Animated.View>

        {/* H8 — one primary at a time. Before the tap: try = primary, skip = ghost. After: start = primary. */}
        {!tapped ? (
          <View style={{ width: '100%', gap: tokens.spacing['12'] }}>
            <Button label={verbs.urge} onPress={handleTap} />
            <Button label="Atla ve başla" variant="ghost" onPress={finish} loading={finishing} />
          </View>
        ) : (
          <View style={{ width: '100%', gap: tokens.spacing['12'] }}>
            <Text variant="body" color="secondary" style={{ textAlign: 'center', marginBottom: tokens.spacing['8'] }}>
              Kaydedildi. Gerçek hayatta da bu kadar kısa sürer.
            </Text>
            <Button label="Başlayalım" onPress={finish} loading={finishing} />
          </View>
        )}
      </View>
    </ModalShell>
  );
}
