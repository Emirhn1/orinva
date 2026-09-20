import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ModalShell, Text, Button, ProgressRing, Surface, Chip } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { computeDelayStats } from '@/utils/journey';
import { commitActed } from '@/utils/actedFlow';

const OPTIONS = [2, 5, 10, 20];

type Step = 'pick' | 'running' | 'ask';

/**
 * F4 — Geciktirme sayacı. "Şimdi değil, N dakika sonra karar ver." When the
 * timer ends the question is simply "Hâlâ istiyor musun?" — most of the time
 * the answer is no, and that becomes the user's own evidence.
 */
export default function DelayTimerScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId?: string; eventId?: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const events = useAppStore((s) => s.events);
  const logEvent = useAppStore((s) => s.logEvent);
  const closeEvent = useAppStore((s) => s.closeEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);

  const behavior = behaviors.find((b) => b.id === params.behaviorId) ?? behaviors.find((b) => !b.archived);
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);
  const [step, setStep] = useState<Step>('pick');
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(0);
  const [totalDelayed, setTotalDelayed] = useState(0); // seconds, across rounds
  const startedAt = useRef<number | null>(null);
  const endsAt = useRef<number | null>(null);

  const stats = useMemo(() => computeDelayStats(events.filter((e) => e.behaviorId === behavior?.id)), [events, behavior]);

  useEffect(() => {
    if (!eventId && behavior) {
      const ev = logEvent({ behaviorId: behavior.id, source: 'delay_timer' });
      setEventId(ev.id);
    }
  }, [behavior]);

  const start = (m: number) => {
    setMinutes(m);
    startedAt.current = Date.now();
    endsAt.current = Date.now() + m * 60_000;
    setRemaining(m * 60);
    setStep('running');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (eventId) updateEvent(eventId, { outcome: 'delayed', outcomeUpdatedAt: new Date().toISOString(), helpedByPlan: 'delay' });
  };

  useEffect(() => {
    if (step !== 'running') return;
    const tick = () => {
      const left = Math.max(0, Math.round(((endsAt.current ?? 0) - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setTotalDelayed((t) => t + minutes * 60);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setStep('ask');
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [step]);

  const elapsedNow = () => (startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : 0);

  const finish = (kind: 'passed' | 'acted') => {
    if (!behavior) return;
    const delaySeconds = totalDelayed + (step === 'running' ? elapsedNow() : 0);
    if (kind === 'acted') {
      commitActed(router, behavior, { eventId, source: 'delay_timer', extra: { delaySeconds, helpedByPlan: 'delay' }, afterQuiet: () => router.replace('/(tabs)/today') });
      return;
    }
    if (eventId) closeEvent(eventId, 'resisted', { delaySeconds, helpedByPlan: 'delay' });
    toast.show({ message: 'Erteledin ve geçti. Kaydettim.', tone: 'success' });
    router.replace('/(tabs)/today');
  };

  const progress = minutes > 0 ? 1 - remaining / (minutes * 60) : 0;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  if (!behavior) return null;

  return (
    <ModalShell onClose={() => (step === 'running' ? finish('passed') : router.back())}>
      {step === 'pick' ? (
        <View>
          <Text variant="headline">Şimdi değil</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
            Karar vermeyi ertele. Süre bitince tekrar soracağız — o zaman ne istersen o.
          </Text>
          <View style={{ flexDirection: 'row', gap: tokens.spacing['8'], flexWrap: 'wrap' }}>
            {OPTIONS.map((m) => (
              <Chip key={m} label={`${m} dk`} selected={minutes === m} onPress={() => setMinutes(m)} />
            ))}
          </View>
          {stats.delayed >= 2 ? (
            <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['24'] }}>
              <Text variant="body" color="secondary">
                {stats.delayed} kez erteledin, {stats.neverReturned}'inde hiç geri dönmedin.
              </Text>
            </Surface>
          ) : null}
          <View style={{ marginTop: tokens.spacing['32'] }}>
            <Button label={`${minutes} dakika ertele`} onPress={() => start(minutes)} />
          </View>
        </View>
      ) : null}

      {step === 'running' ? (
        <View style={{ alignItems: 'center' }}>
          <Text variant="headline" style={{ textAlign: 'center' }}>
            Ertelendi
          </Text>
          <Text variant="body" color="secondary" style={{ textAlign: 'center', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['32'] }}>
            Bu sırada planını dene. Süre bitince buradayız.
          </Text>
          <ProgressRing progress={progress} size={180} strokeWidth={10} color={colors.slateBlue}>
            <Text variant="statLarge" tabular>
              {mm}:{ss}
            </Text>
            <Text variant="caption" color="tertiary">
              kaldı
            </Text>
          </ProgressRing>
          {behavior.planAlternative ? (
            <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['32'], width: '100%' }}>
              <Text variant="caption" color="tertiary">
                Senin planın
              </Text>
              <Text variant="body" style={{ marginTop: tokens.spacing['4'] }}>
                {behavior.planAlternative}
              </Text>
            </Surface>
          ) : null}
          <View style={{ marginTop: tokens.spacing['32'], width: '100%', gap: tokens.spacing['12'] }}>
            <Button label="Geçti, bitir" variant="secondary" onPress={() => finish('passed')} />
            <Button label="Dalgayı bekle" variant="ghost" onPress={() => router.replace({ pathname: '/wave-mode', params: { behaviorId: behavior.id, eventId: eventId ?? '' } })} />
          </View>
        </View>
      ) : null}

      {step === 'ask' ? (
        <View>
          <Text variant="headline">Hâlâ istiyor musun?</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['32'] }}>
            {Math.round(totalDelayed / 60)} dakika geçti. Ne olursa olsun, burada olman değerli.
          </Text>
          <View style={{ gap: tokens.spacing['12'] }}>
            <Button label="Hayır, geçti" onPress={() => finish('passed')} />
            <Button label="Biraz daha ertele" variant="secondary" onPress={() => setStep('pick')} />
            <Button label="Evet, yaptım" variant="ghost" onPress={() => finish('acted')} />
          </View>
        </View>
      ) : null}
    </ModalShell>
  );
}
