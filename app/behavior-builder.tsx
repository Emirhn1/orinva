import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ModalShell, Text, Button, Surface, Input, ChipGroup, Chip } from '@/components/ui';
import { resolveChipLabel, makeCustomChip } from '@/components/ui/ChipGroup';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore, findBehaviorByName } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { BehaviorCategory, BehaviorColor, GoalMode } from '@/data/types';
import { PLAN_CHIPS } from '@/content/chips';
import { BEHAVIOR_TEMPLATES, BEHAVIOR_COLORS, GOAL_LABEL, behaviorAppearanceFor, behaviorVerbsFor, unitWordFor } from '@/content/behaviors';

const MODES: { id: GoalMode; title: string }[] = [
  { id: 'quit', title: 'Bırak' },
  { id: 'reduce', title: 'Azalt' },
  { id: 'delay', title: 'Geciktir' },
  { id: 'notice', title: 'Fark et' },
];

function parseNum(v: string): number | undefined {
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Create or edit a behavior. `?id=` switches to edit mode. */
export default function BehaviorBuilderScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const addBehavior = useAppStore((s) => s.addBehavior);
  const updateBehavior = useAppStore((s) => s.updateBehavior);
  const archiveBehavior = useAppStore((s) => s.archiveBehavior);

  const editing = useMemo(() => behaviors.find((b) => b.id === params.id) ?? null, [behaviors, params.id]);

  const [category, setCategory] = useState<BehaviorCategory | null>(editing?.category ?? null);
  const [name, setName] = useState(editing?.name ?? '');
  const [verbDid, setVerbDid] = useState(editing?.verbDid ?? '');
  const [behaviorColor, setBehaviorColor] = useState<BehaviorColor>(editing?.color ?? 'indigo');
  const [behaviorIcon, setBehaviorIcon] = useState(editing?.icon ?? 'edit-3');
  const [goalMode, setGoalMode] = useState<GoalMode | null>(editing?.goalMode ?? null);
  const [planChip, setPlanChip] = useState<string | null>(() => {
    if (!editing?.planAlternative) return null;
    const known = PLAN_CHIPS.find((c) => c.label === editing.planAlternative);
    return known ? known.id : makeCustomChip(editing.planAlternative);
  });
  const [showEarnings, setShowEarnings] = useState(!!editing?.baselinePerDay);
  const [baseline, setBaseline] = useState(editing?.baselinePerDay ? String(editing.baselinePerDay) : '');
  const [cost, setCost] = useState(editing?.costPerUnit ? String(editing.costPerUnit) : '');
  const [minutes, setMinutes] = useState(editing?.minutesPerUnit ? String(editing.minutesPerUnit) : '');
  const [goalLabel, setGoalLabel] = useState(editing?.savingsGoalLabel ?? '');
  const [goalAmount, setGoalAmount] = useState(editing?.savingsGoalAmount ? String(editing.savingsGoalAmount) : '');
  const [dailyTarget, setDailyTarget] = useState(editing?.dailyTarget ? String(editing.dailyTarget) : '');
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const template = BEHAVIOR_TEMPLATES.find((t) => t.id === category);

  // H2 — nickname must be unique among active behaviors.
  const nameClash = useMemo(() => {
    const found = findBehaviorByName(name, behaviors);
    return found && found.id !== editing?.id ? found : null;
  }, [name, behaviors, editing]);

  // Soft warning: same template + same goal already exists.
  const similar = useMemo(
    () => (editing ? null : behaviors.find((b) => !b.archived && b.category === category && b.goalMode === goalMode) ?? null),
    [behaviors, category, goalMode, editing]
  );

  const canSave = category !== null && goalMode !== null && name.trim().length > 1 && !nameClash;

  const save = () => {
    if (!canSave || !category || !goalMode) return;
    const planAlternative = resolveChipLabel(PLAN_CHIPS, planChip) ?? undefined;
    const earnings = showEarnings
      ? {
          baselinePerDay: parseNum(baseline),
          costPerUnit: parseNum(cost),
          minutesPerUnit: parseNum(minutes),
          savingsGoalLabel: goalLabel.trim() || undefined,
          savingsGoalAmount: parseNum(goalAmount),
          costCurrency: '₺',
        }
      : { baselinePerDay: undefined, costPerUnit: undefined, minutesPerUnit: undefined, savingsGoalLabel: undefined, savingsGoalAmount: undefined };

    const target = goalMode === 'reduce' ? parseNum(dailyTarget) : undefined;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (editing) {
      const verbs = behaviorVerbsFor(category);
      updateBehavior(editing.id, {
        name: name.trim(),
        category,
        verbUrge: verbs.urge,
        verbResist: verbs.resist,
        verbDid: category === 'custom' ? verbDid.trim() || verbs.did : verbs.did,
        needsNameReview: false,
        color: behaviorColor,
        icon: behaviorIcon,
        goalMode,
        planAlternative,
        dailyTarget: target,
        ...earnings,
      });
      toast.show({ message: 'Güncellendi', tone: 'success' });
      router.back();
      return;
    }
    const behavior = addBehavior({
      name: name.trim(),
      category,
      verbDid: category === 'custom' ? verbDid.trim() || undefined : undefined,
      color: behaviorColor,
      icon: behaviorIcon,
      goalMode,
      unit: 'event',
      planAlternative,
      dailyTarget: target,
      ...earnings,
    });
    toast.show({ message: `${behavior.name} eklendi`, tone: 'success' });
    router.replace({ pathname: '/(tabs)/journey/[id]', params: { id: behavior.id } });
  };

  const unitWord = unitWordFor(category);

  return (
    <ModalShell onClose={() => router.back()}>
      <Text variant="headline">{editing ? 'Davranışı düzenle' : 'Yeni davranış'}</Text>

      <View style={{ marginTop: tokens.spacing['20'], gap: tokens.spacing['8'] }}>
        {BEHAVIOR_TEMPLATES.map((t) => {
          const selected = category === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => {
                setCategory(t.id);
                setVerbDid(behaviorVerbsFor(t.id).did);
                const appearance = behaviorAppearanceFor(t.id);
                setBehaviorColor(appearance.color);
                setBehaviorIcon(appearance.icon);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], borderColor: selected ? colors.indigo : colors.border, borderWidth: selected ? 1.5 : 1 }}>
                <Icon name={t.icon} size={20} color={selected ? colors.indigo : colors.textSecondary} />
                <Text variant="label" style={{ flex: 1 }}>
                  {t.title}
                </Text>
                {selected ? <Icon name="check" size={18} color={colors.indigo} /> : null}
              </Surface>
            </Pressable>
          );
        })}
      </View>

      {category ? (
        <View style={{ marginTop: tokens.spacing['20'] }}>
          <Input
            label="Takma ad"
            placeholder={template?.nicknameHint}
            value={name}
            onChangeText={setName}
            maxLength={40}
            error={nameClash ? `"${nameClash.name}" zaten var. Farklı bir ad ver.` : undefined}
          />
          {category === 'custom' ? (
            <View style={{ marginTop: tokens.spacing['16'] }}>
              <Input label="Yaptığında butonda ne yazsın?" placeholder="Yaptım" value={verbDid} onChangeText={setVerbDid} maxLength={24} />
            </View>
          ) : null}
        </View>
      ) : null}

      {category ? (
        <View style={{ marginTop: tokens.spacing['20'] }}>
          <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>Kart rengi ve ikonu</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['12'] }}>
            {BEHAVIOR_COLORS.map((key) => {
              const selected = behaviorColor === key;
              return (
                <Pressable key={key} onPress={() => setBehaviorColor(key)} accessibilityRole="button" accessibilityLabel={`${key} kart rengi`} accessibilityState={{ selected }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors[key], alignItems: 'center', justifyContent: 'center', borderWidth: selected ? 3 : 0, borderColor: colors.textPrimary }}>
                  {selected ? <Icon name="check" size={18} color={colors.onAccent} /> : null}
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'], marginTop: tokens.spacing['12'] }}>
            {BEHAVIOR_TEMPLATES.map((item) => {
              const selected = behaviorIcon === item.icon;
              return (
                <Pressable key={item.id} onPress={() => setBehaviorIcon(item.icon)} accessibilityRole="button" accessibilityLabel={`${item.title} ikonu`} accessibilityState={{ selected }} style={{ width: 44, height: 44, borderRadius: tokens.radius.sm, backgroundColor: selected ? colors[behaviorColor] : colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={item.icon} size={20} color={selected ? colors.onAccent : colors.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>
        Hedef modu
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'] }}>
        {MODES.map((m) => (
          <Chip key={m.id} label={m.title} selected={goalMode === m.id} onPress={() => setGoalMode(m.id)} />
        ))}
      </View>

      {goalMode === 'reduce' ? (
        <View style={{ marginTop: tokens.spacing['16'] }}>
          <Input label={`Günlük hedef (kaç ${unitWord}?)`} placeholder="Örn. 10" value={dailyTarget} onChangeText={setDailyTarget} keyboardType="decimal-pad" />
          <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['8'] }}>
            Bugün'de "4 / 10" olarak görünür. Hedefi aşmak kırmızı bir şey değil; sadece veri.
          </Text>
        </View>
      ) : null}

      {similar && !nameClash ? (
        <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['16'], borderColor: colors.amber }}>
          <Text variant="label">Bunun gibi bir davranışın zaten var</Text>
          <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
            "{similar.name}" · {GOAL_LABEL[similar.goalMode]}. Aynı şeyse ona kaydetmek daha temiz olur.
          </Text>
          <View style={{ marginTop: tokens.spacing['12'] }}>
            <Button label={`"${similar.name}"e git`} variant="secondary" onPress={() => router.replace({ pathname: '/(tabs)/journey/[id]', params: { id: similar.id } })} />
          </View>
        </Surface>
      ) : null}

      <View style={{ marginTop: tokens.spacing['24'] }}>
        <ChipGroup mode="single" label="Zor anda denenecek plan (opsiyonel)" options={PLAN_CHIPS} namespace="plan" value={planChip} onChange={setPlanChip} allowCustom tone="success" />
      </View>

      <View style={{ marginTop: tokens.spacing['24'] }}>
        {!showEarnings ? (
          <Pressable onPress={() => setShowEarnings(true)} accessibilityRole="button">
            <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
              <Icon name="dollar-sign" size={20} color={colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text variant="label">Kazanç sayacını aç</Text>
                <Text variant="caption" color="secondary">
                  İçilmeyen adet, biriken para, geri kazanılan süre.
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.textTertiary} />
            </Surface>
          </Pressable>
        ) : (
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], gap: tokens.spacing['12'] }}>
            <Text variant="label">Kazanç sayacı</Text>
            <Input label={`Önceden günde kaç ${unitWord}?`} placeholder="Örn. 15" value={baseline} onChangeText={setBaseline} keyboardType="decimal-pad" />
            <Input label={`Bir ${unitWord} kaç ₺?`} placeholder="Örn. 4" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
            <Input label={`Bir ${unitWord} kaç dakika?`} placeholder="Örn. 5" value={minutes} onChangeText={setMinutes} keyboardType="decimal-pad" />
            <View style={{ flexDirection: 'row', gap: tokens.spacing['8'] }}>
              <View style={{ flex: 2 }}>
                <Input label="Birikeni bağla (opsiyonel)" placeholder="Örn. Kulaklık" value={goalLabel} onChangeText={setGoalLabel} maxLength={30} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Hedef ₺" placeholder="1500" value={goalAmount} onChangeText={setGoalAmount} keyboardType="decimal-pad" />
              </View>
            </View>
            <Text variant="caption" color="tertiary" onPress={() => setShowEarnings(false)} accessibilityRole="button">
              Sayacı kapat
            </Text>
          </Surface>
        )}
      </View>

      <View style={{ marginTop: tokens.spacing['32'] }}>
        {showGuidance && !canSave ? <Text variant="caption" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>Davranış, takma ad ve hedef modu seçildiğinde kaydedebilirsin.</Text> : null}
        <Button label={editing ? 'Kaydet' : 'Kaydet ve başla'} onPress={() => canSave ? save() : setShowGuidance(true)} />
      </View>

      {editing ? (
        <View style={{ marginTop: tokens.spacing['24'] }}>
          {!confirmArchive ? (
            <Button label="Bu davranışı arşivle" variant="critical" onPress={() => setConfirmArchive(true)} />
          ) : (
            <View style={{ gap: tokens.spacing['8'] }}>
              <Text variant="caption" color="secondary">
                Kayıtların silinmez; davranış listeden kalkar. Sen sekmesinden geri açabilirsin.
              </Text>
              <Button
                label="Evet, arşivle"
                variant="critical"
                onPress={() => {
                  archiveBehavior(editing.id);
                  toast.show({ message: 'Arşivlendi', icon: 'info' });
                  router.replace('/(tabs)/journey');
                }}
              />
              <Button label="Vazgeç" variant="ghost" onPress={() => setConfirmArchive(false)} />
            </View>
          )}
        </View>
      ) : null}
    </ModalShell>
  );
}
