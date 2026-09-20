import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell } from '@/components/ui';
import { Text, Button, Surface, Input, IconButton } from '@/components/ui';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { BehaviorCategory } from '@/data/types';

const TEMPLATES: { id: BehaviorCategory; title: string; description: string; icon: IconName }[] = [
  { id: 'nicotine', title: 'Sigara / Nikotin', description: 'Net olay, sık dürtü, somut ilerleme', icon: 'zap' },
  { id: 'social_media', title: 'Telefon / Sosyal medya', description: 'Otomatik pilotu kırmak', icon: 'grid' },
  { id: 'custom', title: 'Kendi davranışım', description: 'Tekrar eden, senin tanımladığın bir davranış', icon: 'edit-3' },
];

export default function OnboardingFocus() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const { category, customName, set } = useOnboardingStore();

  const canContinue = category !== null && (category !== 'custom' || customName.trim().length > 1);

  return (
    <ModalShell onClose={() => router.back()} progress={1 / 5}>
      <Text variant="headline">Bir ana odak seç</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        İlk 14 gün tek bir odakla ilerleyeceğiz. İkinci bir davranışı sonra ekleyebilirsin.
      </Text>

      <View style={{ gap: tokens.spacing['12'] }}>
        {TEMPLATES.map((t) => {
          const selected = category === t.id;
          return (
            <Pressable key={t.id} onPress={() => set({ category: t.id })}>
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
                <View style={{ width: 44, height: 44, borderRadius: tokens.radius.sm, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={t.icon} size={22} color={selected ? colors.indigo : colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{t.title}</Text>
                  <Text variant="caption" color="secondary">{t.description}</Text>
                </View>
                {selected ? <Icon name="check" size={20} color={colors.indigo} /> : null}
              </Surface>
            </Pressable>
          );
        })}
      </View>

      {category === 'custom' ? (
        <View style={{ marginTop: tokens.spacing['16'] }}>
          <Input
            label="Bu davranışa ne isim vermek istersin?"
            placeholder="Örn. Gece eski fotoğraflara bakmak"
            value={customName}
            onChangeText={(v) => set({ customName: v })}
          />
        </View>
      ) : null}

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Devam et" disabled={!canContinue} onPress={() => router.push('/onboarding/goal')} />
      </View>
    </ModalShell>
  );
}
