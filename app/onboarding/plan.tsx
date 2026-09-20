import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell, Text, Button, TextArea } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function OnboardingPlan() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { reasonText, planAlternative, set } = useOnboardingStore();

  return (
    <ModalShell onClose={() => router.back()} progress={3 / 5}>
      <Text variant="headline">Tek bir neden, tek bir plan</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Bu değişim sana ne kazandırsın? Ve zor an geldiğinde ilk ne denemek istersin?
      </Text>

      <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
        Bu değişim sana ne kazandırsın?
      </Text>
      <TextArea
        placeholder="Örn. Sabahları kendimi daha hafif hissetmek istiyorum"
        value={reasonText}
        onChangeText={(v) => set({ reasonText: v })}
        style={{ marginBottom: tokens.spacing['20'] }}
      />

      <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
        Zor an geldiğinde ilk ne denemek istersin?
      </Text>
      <TextArea
        placeholder="Örn. Su içip 2 dakika bekleyeceğim"
        value={planAlternative}
        onChangeText={(v) => set({ planAlternative: v })}
      />

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Devam et" onPress={() => router.push('/onboarding/demo')} />
      </View>
    </ModalShell>
  );
}
