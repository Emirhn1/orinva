import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ModalShell, Text, Button } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAppStore } from '@/store/useAppStore';

const CATEGORY_LABEL: Record<string, string> = {
  nicotine: 'Sigara / Nikotin',
  social_media: 'Telefon / Sosyal medya',
  custom: '',
};

export default function OnboardingDemo() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const draft = useOnboardingStore();
  const { addBehavior, addReason, logEvent, closeEvent, completeOnboarding } = useAppStore();
  const [tapped, setTapped] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const behaviorName = draft.category === 'custom' ? draft.customName : CATEGORY_LABEL[draft.category ?? 'custom'];

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTapped(true);
  };

  const finish = () => {
    if (finishing || !draft.category || !draft.goalMode) return;
    setFinishing(true);
    const behavior = addBehavior({
      name: behaviorName || 'Davranışım',
      category: draft.category,
      goalMode: draft.goalMode,
      unit: 'event',
      planAlternative: draft.planAlternative || undefined,
    });
    if (draft.reasonText.trim()) {
      addReason(behavior.id, 'reason', draft.reasonText.trim());
    }
    if (tapped) {
      const event = logEvent({ behaviorId: behavior.id, kind: 'urge' });
      closeEvent(event.id, 'passed');
    }
    completeOnboarding();
    router.replace('/(tabs)/today');
  };

  return (
    <ModalShell progress={5 / 5}>
      <View style={{ alignItems: 'center' }}>
        <Text variant="headline" style={{ textAlign: 'center' }}>Şimdi gerçekten dene</Text>
        <Text variant="body" color="secondary" style={{ textAlign: 'center', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['40'] }}>
          Zor anlarda kullanacağın butonun aynısı. İstersen şimdi bir kez dene, istersen atla.
        </Text>

        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: tapped ? colors.successSoft : colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing['32'],
          }}
        >
          <Icon name={tapped ? 'check' : 'wind'} size={40} color={tapped ? colors.success : colors.indigo} />
        </View>

        {!tapped ? (
          <Button label="Dürtü geldi" onPress={handleTap} fullWidth />
        ) : (
          <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Kaydedildi. Gerçek hayatta da bu kadar kısa sürer.
          </Text>
        )}

        <View style={{ marginTop: tokens.spacing['40'], width: '100%', gap: tokens.spacing['12'] }}>
          <Button label="Başlayalım" onPress={finish} loading={finishing} />
        </View>
      </View>
    </ModalShell>
  );
}
