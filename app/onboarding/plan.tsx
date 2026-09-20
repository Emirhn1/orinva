import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell, Text, Button, ChipGroup } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { WHY_CHIPS, PLAN_CHIPS } from '@/content/chips';

/** Plan §4.1 A+B — reasons and the first plan are chips; typing is the optional escape hatch. */
export default function OnboardingPlan() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { whyChips, planChip, set } = useOnboardingStore();

  return (
    <ModalShell onClose={() => router.back()} progress={3 / 4}>
      <Text variant="headline">Tek bir neden, tek bir plan</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        İkisi de atlanabilir. Seçersen zor anda karşına kendi sözlerin çıkar.
      </Text>

      <ChipGroup
        mode="multi"
        label="Bu değişim sana ne kazandırsın?"
        options={WHY_CHIPS}
        namespace="why"
        value={whyChips}
        onChange={(v) => set({ whyChips: v })}
        max={3}
        allowCustom
        customPlaceholder="Kendi cümlenle…"
      />

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <ChipGroup
          mode="single"
          label="Zor an geldiğinde ilk ne denemek istersin?"
          options={PLAN_CHIPS}
          namespace="plan"
          value={planChip}
          onChange={(v) => set({ planChip: v })}
          allowCustom
          customPlaceholder="Kendi planın…"
          tone="success"
        />
      </View>

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Devam et" onPress={() => router.push('/onboarding/demo')} />
      </View>
    </ModalShell>
  );
}
