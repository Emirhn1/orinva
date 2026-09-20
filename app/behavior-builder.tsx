import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell, Text, Button, Surface, Input } from '@/components/ui';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { BehaviorCategory, GoalMode } from '@/data/types';

const TEMPLATES: { id: BehaviorCategory; title: string; icon: IconName }[] = [
  { id: 'nicotine', title: 'Sigara / Nikotin', icon: 'zap' },
  { id: 'social_media', title: 'Telefon / Sosyal medya', icon: 'grid' },
  { id: 'custom', title: 'Kendi davranışım', icon: 'edit-3' },
];

const MODES: { id: GoalMode; title: string }[] = [
  { id: 'quit', title: 'Bırak' },
  { id: 'reduce', title: 'Azalt' },
  { id: 'delay', title: 'Geciktir' },
  { id: 'notice', title: 'Fark et' },
];

export default function BehaviorBuilderScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const addBehavior = useAppStore((s) => s.addBehavior);

  const [category, setCategory] = useState<BehaviorCategory | null>(null);
  const [name, setName] = useState('');
  const [goalMode, setGoalMode] = useState<GoalMode | null>(null);
  const [plan, setPlan] = useState('');

  const displayName = category === 'custom' ? name : TEMPLATES.find((t) => t.id === category)?.title ?? '';
  const canSave = category !== null && goalMode !== null && (category !== 'custom' || name.trim().length > 1);

  const save = () => {
    if (!canSave || !category || !goalMode) return;
    const behavior = addBehavior({ name: displayName, category, goalMode, unit: 'event', planAlternative: plan || undefined });
    router.replace({ pathname: '/(tabs)/journey/[id]', params: { id: behavior.id } });
  };

  return (
    <ModalShell onClose={() => router.back()}>
      <Text variant="headline">Yeni davranış</Text>

      <View style={{ marginTop: tokens.spacing['20'], gap: tokens.spacing['8'] }}>
        {TEMPLATES.map((t) => {
          const selected = category === t.id;
          return (
            <Pressable key={t.id} onPress={() => setCategory(t.id)}>
              <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], borderColor: selected ? colors.indigo : colors.border, borderWidth: selected ? 1.5 : 1 }}>
                <Icon name={t.icon} size={20} color={selected ? colors.indigo : colors.textSecondary} />
                <Text variant="label" style={{ flex: 1 }}>{t.title}</Text>
                {selected ? <Icon name="check" size={18} color={colors.indigo} /> : null}
              </Surface>
            </Pressable>
          );
        })}
      </View>

      {category === 'custom' ? (
        <View style={{ marginTop: tokens.spacing['16'] }}>
          <Input label="İsim" placeholder="Örn. Gece eski fotoğraflara bakmak" value={name} onChangeText={setName} />
        </View>
      ) : null}

      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>Hedef modu</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'] }}>
        {MODES.map((m) => {
          const selected = goalMode === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setGoalMode(m.id)}
              style={{ paddingHorizontal: tokens.spacing['16'], height: 44, borderRadius: tokens.radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.indigo : colors.surfaceSecondary }}
            >
              <Text variant="label" color={selected ? 'onAccent' : 'secondary'}>{m.title}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Input label="Zor anda denenecek plan (opsiyonel)" placeholder="Örn. Su içip 2 dakika bekleyeceğim" value={plan} onChangeText={setPlan} />
      </View>

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Kaydet ve başla" disabled={!canSave} onPress={save} />
      </View>
    </ModalShell>
  );
}
