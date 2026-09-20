import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Button, CravingSelector, IconButton, IntensityDrop, Surface } from '@/components/ui';
import { WaveField, BreathPhase } from '@/components/wave/WaveField';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { EventOutcome } from '@/data/types';

const SESSION_SECONDS = 180;
const BREATH_SECONDS = 4;

type Step = 'before' | 'wave' | 'after';

/**
 * F1 — Dalga Modu. The urge is a wave: it rises, peaks and passes. The user
 * watches the water breathe for three minutes, then rates the urge again so
 * they see their own evidence ("4'ten 2'ye düştü").
 */
export default function WaveModeScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId?: string; eventId?: string; intensity?: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const reasons = useAppStore((s) => s.reasons);
  const logEvent = useAppStore((s) => s.logEvent);
  const closeEvent = useAppStore((s) => s.closeEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);

  const behavior = behaviors.find((b) => b.id === params.behaviorId) ?? behaviors.find((b) => !b.archived);
  const reason = useMemo(
    () => reasons.find((r) => r.type === 'reason' && (r.behaviorId === behavior?.id || r.behaviorId === null)),
    [reasons, behavior]
  );

  const presetIntensity = params.intensity ? Number(params.intensity) : null;
  const [before, setBefore] = useState<number | null>(Number.isFinite(presetIntensity) && presetIntensity ? presetIntensity : null);
  const [after, setAfter] = useState<number | null>(null);
  const [step, setStep] = useState<Step>(before ? 'wave' : 'before');
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const endsAt = useRef<number | null>(null);

  // Make sure there's an event to attach the measurement to.
  useEffect(() => {
    if (!eventId && behavior) {
      const ev = logEvent({ behaviorId: behavior.id, intensity: before, source: 'wave' });
      setEventId(ev.id);
    }
  }, [behavior]);

  // Persist the "before" intensity if it was only chosen here.
  useEffect(() => {
    if (eventId && before !== null && !presetIntensity) updateEvent(eventId, { intensity: before });
  }, [before, eventId]);

  // Countdown — anchored to a timestamp so backgrounding doesn't drift it.
  useEffect(() => {
    if (step !== 'wave') return;
    endsAt.current = Date.now() + SESSION_SECONDS * 1000;
    const tick = () => {
      const left = Math.max(0, Math.round(((endsAt.current ?? 0) - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setStep('after');
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [step]);

  const finish = (outcome: EventOutcome) => {
    if (!behavior) return;
    if (outcome === 'acted') {
      router.replace({ pathname: '/relapse-recovery', params: { behaviorId: behavior.id, eventId: eventId ?? '' } });
      return;
    }
    if (eventId) closeEvent(eventId, outcome, { intensityAfter: after, helpedByPlan: 'wave' });
    if (outcome === 'resisted') {
      toast.show({ message: 'Dalga geçti. Kaydettim.', tone: 'success' });
    }
    router.replace('/(tabs)/today');
  };

  const stillWant = () => {
    if (!behavior) return;
    if (eventId) updateEvent(eventId, { intensityAfter: after, helpedByPlan: 'wave' });
    router.replace({ pathname: '/delay-timer', params: { behaviorId: behavior.id, eventId: eventId ?? '' } });
  };

  const mm = String(Math.floor(remaining / 60)).padStart(1, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: tokens.spacing['20'], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: tokens.componentHeight.topNav }}>
        <Text variant="label" color="secondary">
          {behavior?.name ?? ''}
        </Text>
        <IconButton name="x" accessibilityLabel="Kapat" onPress={() => (step === 'wave' ? setStep('after') : router.back())} />
      </View>

      {step === 'before' ? (
        <View style={{ flex: 1, paddingHorizontal: tokens.spacing['20'], justifyContent: 'center' }}>
          <Text variant="headline">Dalga ne kadar güçlü?</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
            Şimdi işaretle; üç dakika sonra tekrar soracağız.
          </Text>
          <CravingSelector value={before} onChange={setBefore} />
          <View style={{ marginTop: tokens.spacing['40'], gap: tokens.spacing['12'] }}>
            <Button label="Dalgayı başlat" onPress={() => setStep('wave')} />
            <Button label="İşaretlemeden başla" variant="ghost" onPress={() => setStep('wave')} />
          </View>
        </View>
      ) : null}

      {step === 'wave' ? (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: tokens.spacing['20'] }}>
            <Text variant="caption" color="tertiary" style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
              {phase === 'inhale' ? 'Nefes al' : 'Ver'}
            </Text>
            <Text variant="display" tabular style={{ marginTop: tokens.spacing['8'] }}>
              {mm}:{ss}
            </Text>
            <Text variant="body" color="secondary" style={{ textAlign: 'center', marginTop: tokens.spacing['16'], maxWidth: 320 }}>
              Dürtü bir dalga gibi yükselir, zirve yapar ve geçer. Hiçbir şey yapman gerekmiyor — sadece izle.
            </Text>
            {reason ? (
              <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['24'], maxWidth: 360 }}>
                <Text variant="caption" color="tertiary">
                  Senin nedenin
                </Text>
                <Text variant="body" serif style={{ marginTop: tokens.spacing['4'] }}>
                  {reason.text}
                </Text>
              </Surface>
            ) : null}
          </View>
          <WaveField running height={260} breathSeconds={BREATH_SECONDS} onPhase={setPhase} />
          <View style={{ paddingHorizontal: tokens.spacing['20'], paddingBottom: tokens.spacing['16'], marginTop: -tokens.spacing['48'] }}>
            <Pressable onPress={() => setStep('after')} hitSlop={10} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: tokens.spacing['12'] }}>
              <Text variant="label" color="secondary">
                Erken bitir
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 'after' ? (
        <View style={{ flex: 1, paddingHorizontal: tokens.spacing['20'], justifyContent: 'center' }}>
          <Text variant="headline">Dürtü şimdi ne kadar güçlü?</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
            Kendi kanıtını gör.
          </Text>
          <CravingSelector value={after} onChange={setAfter} />
          {before !== null && after !== null ? (
            <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['24'] }}>
              <Text variant="label" style={{ marginBottom: tokens.spacing['12'] }}>
                {after < before ? `${before}'ten ${after}'ye düştü.` : after === before ? 'Aynı kaldı — bu da bir veri.' : 'Biraz yükseldi. Bu olabilir; dalga hâlâ geçer.'}
              </Text>
              <IntensityDrop before={before} after={after} />
            </Surface>
          ) : null}
          <View style={{ marginTop: tokens.spacing['32'], gap: tokens.spacing['12'] }}>
            <Button label="Geçti" onPress={() => finish('resisted')} />
            <Button label="Hâlâ istiyorum · ertele" variant="secondary" onPress={stillWant} />
            <Button label="Yaptım" variant="ghost" onPress={() => finish('acted')} />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
