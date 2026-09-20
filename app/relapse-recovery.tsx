import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ModalShell, Text, Button, Surface, ChipGroup } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { computeJourneySummary } from '@/utils/journey';
import { TRIGGER_CHIPS, PLAN_CHIPS } from '@/content/chips';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { usageKey } from '@/utils/chips';

type Step = 'welcome' | 'learn' | 'next' | 'reason';

/**
 * Relapse & Recovery — DESIGN.md §35. No red, no reset animation, no guilt.
 * The slip is recorded as data; the flow leads forward. The optional "learn"
 * step (F5 seed) captures what happened + what to try next time as a chip
 * pair so the next hard moment has a targeted plan.
 */
export default function RelapseRecoveryScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId?: string; eventId?: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const events = useAppStore((s) => s.events);
  const reasons = useAppStore((s) => s.reasons);
  const logEvent = useAppStore((s) => s.logEvent);
  const closeEvent = useAppStore((s) => s.closeEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);

  const behavior = behaviors.find((b) => b.id === params.behaviorId) ?? behaviors.find((b) => !b.archived);
  const [step, setStep] = useState<Step>('welcome');
  const [eventId, setEventId] = useState<string | null>(params.eventId || null);
  const [recorded, setRecorded] = useState(false);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [nextPlan, setNextPlan] = useState<string | null>(null);

  const reason = reasons.find((r) => r.type === 'reason' && (r.behaviorId === behavior?.id || r.behaviorId === null));

  useEffect(() => {
    if (!behavior || recorded) return;
    let id = eventId;
    if (id) {
      closeEvent(id, 'acted');
    } else {
      const ev = logEvent({ behaviorId: behavior.id, outcome: 'acted', source: 'app' });
      id = ev.id;
      setEventId(id);
    }
    setRecorded(true);
    // §41: no haptic here. §19: the undo toast still applies — honesty must be reversible too.
    const undoId = id;
    toast.show({
      message: 'Kaydedildi',
      icon: 'check',
      actionLabel: 'Geri al',
      durationMs: tokens.motion.undoWindow,
      onAction: () => {
        if (undoId) removeEvent(undoId);
        router.replace('/(tabs)/today');
      },
    });
  }, [behavior]);

  const existing = useMemo(() => events.find((e) => e.id === eventId) ?? null, [events, eventId]);

  useEffect(() => {
    if (existing?.triggers?.length && triggers.length === 0) setTriggers(existing.triggers);
  }, [existing?.id]);

  const summary = useMemo(() => computeJourneySummary(events.filter((e) => e.behaviorId === behavior?.id)), [events, behavior]);

  if (!behavior) return null;

  const finish = () => router.replace('/(tabs)/today');

  const saveLearn = () => {
    if (eventId) {
      const noteParts: string[] = [];
      if (nextPlan) noteParts.push(`Bir dahaki sefere: ${resolveChipLabel(PLAN_CHIPS, nextPlan)}`);
      const prev = existing?.note ? `${existing.note}\n` : '';
      updateEvent(eventId, { triggers, note: noteParts.length ? `${prev}${noteParts.join(' · ')}` : existing?.note ?? null });
    }
    bumpChipUsage([...triggers.map((t) => usageKey('trigger', t)), ...(nextPlan ? [usageKey('plan', nextPlan)] : [])]);
    setStep('next');
  };

  return (
    <ModalShell onClose={finish}>
      {step === 'welcome' && (
        <View>
          <Text variant="headline">Bunu kaydetmen değerli</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['12'] }}>
            Bu tek olay yolculuğunun tamamı değil. Bu bir veri noktası, bir günah değil.
          </Text>
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['24'] }}>
            <Text variant="body" color="secondary">
              Son 30 günde {summary.contactDays} gün planınla temas ettin
              {summary.resistedOrDelayed > 0 ? `, ${summary.resistedOrDelayed} kez kısa bir ara sana yardımcı oldu` : ''}.
            </Text>
          </Surface>
          <View style={{ marginTop: tokens.spacing['32'], gap: tokens.spacing['12'] }}>
            <Button label="Devam et" onPress={() => setStep('learn')} />
            <Button label="Şimdilik kapat" variant="ghost" onPress={finish} />
          </View>
        </View>
      )}

      {step === 'learn' && (
        <View>
          <Text variant="headline">Ne oldu?</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
            İstersen atla. Seçersen, bir dahaki sefer o tetikleyiciye özel planın hazır olur.
          </Text>
          <ChipGroup mode="multi" label="Tetikleyici" options={TRIGGER_CHIPS} namespace="trigger" value={triggers} onChange={setTriggers} max={3} allowCustom />
          <View style={{ marginTop: tokens.spacing['24'] }}>
            <ChipGroup mode="single" label="Bir dahaki sefere ne denersin?" options={PLAN_CHIPS} namespace="plan" value={nextPlan} onChange={setNextPlan} allowCustom tone="success" />
          </View>
          <View style={{ marginTop: tokens.spacing['32'], gap: tokens.spacing['12'] }}>
            <Button label="Kaydet" onPress={saveLearn} haptic="none" />
            <Button label="Atla" variant="ghost" onPress={() => setStep('next')} />
          </View>
        </View>
      )}

      {step === 'next' && (
        <View>
          <Text variant="headline">Şimdi ne yardımcı olur?</Text>
          <View style={{ marginTop: tokens.spacing['24'], gap: tokens.spacing['12'] }}>
            {reason ? <Button label="Nedenimi gör" variant="secondary" onPress={() => setStep('reason')} /> : null}
            <Button label="Kısaca not al" variant="secondary" onPress={() => router.replace({ pathname: '/(tabs)/journal/new', params: { eventId: eventId ?? '', tag: 'slip_review' } })} />
            <Button label="Şimdilik kapat" variant="ghost" onPress={finish} />
          </View>
        </View>
      )}

      {step === 'reason' && (
        <View>
          <Text variant="headline">Senin nedenin</Text>
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['20'] }}>
            <Text variant="bodyLarge" serif>
              {reason?.text}
            </Text>
          </Surface>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['24'] }}>
            Bugün yeniden başlamak için tek karar yeter.
          </Text>
          <View style={{ marginTop: tokens.spacing['32'] }}>
            <Button label="Tamam" onPress={finish} />
          </View>
        </View>
      )}
    </ModalShell>
  );
}
