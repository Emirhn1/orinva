import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell, Text, Button, Surface, Input } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { BEHAVIOR_TEMPLATES } from '@/content/behaviors';


export default function OnboardingFocus() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const { category, nickname, set } = useOnboardingStore();

  const template = BEHAVIOR_TEMPLATES.find((t) => t.id === category);
  const canContinue = category !== null && nickname.trim().length > 1;

  return (
    <ModalShell onClose={() => router.back()} progress={1 / 5}>
      <Text variant="headline">Bir ana odak seç</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        İlk 14 gün tek bir odakla ilerleyeceğiz. İkinci bir davranışı sonra ekleyebilirsin.
      </Text>

      <View style={{ gap: tokens.spacing['12'] }}>
        {BEHAVIOR_TEMPLATES.map((t) => {
          const selected = category === t.id;
          return (
            <Pressable key={t.id} onPress={() => set({ category: t.id })} accessibilityRole="button" accessibilityState={{ selected }}>
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
                  <Text variant="caption" color="secondary">
                    {t.description}
                  </Text>
                </View>
                {selected ? <Icon name="check" size={20} color={colors.indigo} /> : null}
              </Surface>
            </Pressable>
          );
        })}
      </View>

      {category ? (
        <View style={{ marginTop: tokens.spacing['20'] }}>
          <Input
            label="Buna ne diyelim?"
            placeholder={template?.nicknameHint}
            value={nickname}
            onChangeText={(v) => set({ nickname: v })}
            maxLength={40}
            autoCapitalize="sentences"
          />
          <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['8'] }}>
            Kısa bir takma ad; birden fazla davranış eklediğinde hangisi hangisi belli olsun.
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Devam et" disabled={!canContinue} onPress={() => router.push('/onboarding/goal')} />
      </View>
    </ModalShell>
  );
}
