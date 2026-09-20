import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell, Text, Button, Surface } from '@/components/ui';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { GoalMode } from '@/data/types';

const MODES: { id: GoalMode; title: string; description: string; icon: IconName }[] = [
  { id: 'quit', title: 'Bırak', description: 'Bu davranışı tamamen bırakmak istiyorum', icon: 'x' },
  { id: 'reduce', title: 'Azalt', description: 'Planlı bir limit veya sıklık istiyorum', icon: 'trending-up' },
  { id: 'delay', title: 'Geciktir', description: 'Otomatik davranış öncesi ara vermek istiyorum', icon: 'clock' },
  { id: 'notice', title: 'Fark et', description: 'Şimdilik sadece kaydetmek istiyorum', icon: 'compass' },
];

export default function OnboardingGoal() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const { goalMode, set } = useOnboardingStore();

  return (
    <ModalShell onClose={() => router.back()} progress={2 / 5}>
      <Text variant="headline">Hedef modun ne?</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Her niyete saygı duyarız — mükemmel olmak zorunda değilsin.
      </Text>

      <View style={{ gap: tokens.spacing['12'] }}>
        {MODES.map((m) => {
          const selected = goalMode === m.id;
          return (
            <Pressable key={m.id} onPress={() => set({ goalMode: m.id })}>
              <Surface
                radius="lg"
                bordered
                style={{
                  padding: tokens.spacing['16'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: tokens.spacing['16'],
                  borderColor: selected ? colors.indigo : colors.border,
                  borderWidth: selected ? 1.5 : 1,
                }}
              >
                <Icon name={m.icon} size={22} color={selected ? colors.indigo : colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text variant="label">{m.title}</Text>
                  <Text variant="caption" color="secondary">{m.description}</Text>
                </View>
                {selected ? <Icon name="check" size={20} color={colors.indigo} /> : null}
              </Surface>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Devam et" disabled={!goalMode} onPress={() => router.push('/onboarding/plan')} />
      </View>
    </ModalShell>
  );
}
