import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell, Text, Button, Surface, Input } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { BEHAVIOR_TEMPLATES, BEHAVIOR_COLORS, behaviorAppearanceFor, behaviorVerbsFor } from '@/content/behaviors';


export default function OnboardingFocus() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const { category, nickname, verbDid, behaviorColor, behaviorIcon, set } = useOnboardingStore();
  const [showGuidance, setShowGuidance] = useState(false);

  const template = BEHAVIOR_TEMPLATES.find((t) => t.id === category);
  const canContinue = category !== null && nickname.trim().length > 1;

  return (
    <ModalShell onClose={() => router.back()} progress={1 / 5}>
      <Text variant="headline">Bir ana odak seç</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Tek odakla başlamanı öneriyoruz — ama istediğin zaman yeni bir davranış ekleyebilirsin.
      </Text>

      <View style={{ gap: tokens.spacing['12'] }}>
        {BEHAVIOR_TEMPLATES.map((t) => {
          const selected = category === t.id;
          return (
            <Pressable key={t.id} onPress={() => { const appearance = behaviorAppearanceFor(t.id); set({ category: t.id, verbDid: behaviorVerbsFor(t.id).did, behaviorColor: appearance.color, behaviorIcon: appearance.icon }); }} accessibilityRole="button" accessibilityState={{ selected }}>
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
            Kısa bir takma ad; birden fazla davranış eklediğinde hangisinin hangisi olduğu belli olsun.
          </Text>
          {category === 'custom' ? (
            <View style={{ marginTop: tokens.spacing['16'] }}>
              <Input
                label="Yaptığında butonda ne yazsın?"
                placeholder="Yaptım"
                value={verbDid}
                onChangeText={(value) => set({ verbDid: value })}
                maxLength={24}
                autoCapitalize="sentences"
              />
            </View>
          ) : null}
          <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['20'], marginBottom: tokens.spacing['8'] }}>Kart rengi ve ikonu</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['12'] }}>
            {BEHAVIOR_COLORS.map((key) => <Pressable key={key} onPress={() => set({ behaviorColor: key })} accessibilityRole="button" accessibilityLabel={`${key} kart rengi`} accessibilityState={{ selected: behaviorColor === key }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors[key], alignItems: 'center', justifyContent: 'center', borderWidth: behaviorColor === key ? 3 : 0, borderColor: colors.textPrimary }}>{behaviorColor === key ? <Icon name="check" size={18} color={colors.onAccent} /> : null}</Pressable>)}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'], marginTop: tokens.spacing['12'] }}>
            {BEHAVIOR_TEMPLATES.map((item) => <Pressable key={item.id} onPress={() => set({ behaviorIcon: item.icon })} accessibilityRole="button" accessibilityLabel={`${item.title} ikonu`} accessibilityState={{ selected: behaviorIcon === item.icon }} style={{ width: 44, height: 44, borderRadius: tokens.radius.sm, backgroundColor: behaviorIcon === item.icon ? colors[behaviorColor] : colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={20} color={behaviorIcon === item.icon ? colors.onAccent : colors.textSecondary} /></Pressable>)}
          </View>
        </View>
      ) : null}

      <View style={{ marginTop: tokens.spacing['32'] }}>
        {showGuidance && !canContinue ? <Text variant="caption" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>Bir davranış seçip ona kısa bir takma ad verdiğinde devam edebilirsin.</Text> : null}
        <Button label="Devam et" onPress={() => canContinue ? router.push('/onboarding/goal') : setShowGuidance(true)} />
      </View>
    </ModalShell>
  );
}
