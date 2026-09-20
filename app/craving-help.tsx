import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ModalShell, Text, Button, CravingSelector, Surface } from '@/components/ui';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { MICRO_PLAN_OPTIONS } from '@/content/library';
import { EventOutcome } from '@/data/types';

type Step = 'notice' | 'breathe' | 'plan' | 'closure' | 'help';

export default function CravingHelpScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId: string; eventId?: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const reasons = useAppStore((s) => s.reasons);
  const logEvent = useAppStore((s) => s.logEvent);
  const closeEvent = useAppStore((s) => s.closeEvent);

  const behavior = behaviors.find((b) => b.id === params.behaviorId) ?? behaviors[0];
  const reason = reasons.find((r) => r.type === 'reason' && (r.behaviorId === behavior?.id || r.behaviorId === null));

  const [step, setStep] = useState<Step>('notice');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);

  useEffect(() => {
    if (!eventId && behavior) {
      const event = logEvent({ behaviorId: behavior.id, kind: 'urge', intensity: null });
      setEventId(event.id);
    }
  }, [behavior]);

  const stepIndex = { notice: 0, breathe: 1, plan: 2, closure: 3, help: 3 }[step];

  const finish = (outcome: EventOutcome) => {
    if (!behavior) return;
    if (outcome === 'acted') {
      router.replace({ pathname: '/relapse-recovery', params: { behaviorId: behavior.id, eventId: eventId ?? '' } });
      return;
    }
    if (eventId) closeEvent(eventId, outcome, selectedPlan);
    router.replace('/(tabs)/today');
  };

  if (!behavior) return null;

  const footer = (
    <Text variant="caption" color="tertiary" onPress={() => setStep('help')}>
      Kriz desteği
    </Text>
  );

  return (
    <ModalShell onClose={() => router.back()} progress={(stepIndex + 1) / 4} footer={footer}>
      {step === 'notice' && (
        <NoticeStep
          intensity={intensity}
          setIntensity={setIntensity}
          onNext={() => setStep('breathe')}
        />
      )}
      {step === 'breathe' && <BreatheStep onNext={() => setStep('plan')} />}
      {step === 'plan' && (
        <PlanStep
          reasonText={reason?.text ?? null}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          planAlternative={behavior.planAlternative}
          onNext={() => setStep('closure')}
        />
      )}
      {step === 'closure' && <ClosureStep onOutcome={finish} />}
      {step === 'help' && <HelpStep onBack={() => setStep('closure')} />}
    </ModalShell>
  );
}

function NoticeStep({ intensity, setIntensity, onNext }: { intensity: number | null; setIntensity: (n: number) => void; onNext: () => void }) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text variant="headline">Şu an dürtü var</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Burada olduğun için iyi. Şiddetini işaretlemek istersen (opsiyonel):
      </Text>
      <CravingSelector value={intensity} onChange={setIntensity} />
      <View style={{ marginTop: tokens.spacing['40'] }}>
        <Button label="Devam et" onPress={onNext} />
      </View>
    </View>
  );
}

function BreatheStep({ onNext }: { onNext: () => void }) {
  const { colors, tokens } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: tokens.motion.breathingCycle, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: tokens.motion.breathingCycle, useNativeDriver: true }),
      ])
    );
    loop.start();
    const interval = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => {
      loop.stop();
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={{ alignItems: 'center' }}>
      <Text variant="headline" style={{ textAlign: 'center' }}>Alan aç</Text>
      <Text variant="body" color="secondary" style={{ textAlign: 'center', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['40'] }}>
        Yavaşça nefes al. İstersen sadece gözlemle.
      </Text>
      <Animated.View
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: colors.cyan + '22',
          borderWidth: 2,
          borderColor: colors.cyan,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale }],
        }}
      >
        <Text variant="statSmall" tabular color="slateBlue">{seconds}</Text>
      </Animated.View>
      <View style={{ marginTop: tokens.spacing['40'], width: '100%', gap: tokens.spacing['12'] }}>
        <Button label="Devam et" onPress={onNext} />
        <Button label="Geç" variant="ghost" onPress={onNext} />
      </View>
    </View>
  );
}

function PlanStep({
  reasonText,
  selectedPlan,
  setSelectedPlan,
  planAlternative,
  onNext,
}: {
  reasonText: string | null;
  selectedPlan: string | null;
  setSelectedPlan: (id: string) => void;
  planAlternative?: string;
  onNext: () => void;
}) {
  const { colors, tokens } = useTheme();
  const options = MICRO_PLAN_OPTIONS.filter((o) => o.id !== 'reason' || reasonText);

  return (
    <View>
      <Text variant="headline">Şimdi ne yardımcı olur?</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        Kendi planın öncelikli. Birini seç, ya da kendi yolunu izle.
      </Text>

      {planAlternative ? (
        <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginBottom: tokens.spacing['16'] }}>
          <Text variant="caption" color="tertiary">Senin planın</Text>
          <Text variant="body" style={{ marginTop: tokens.spacing['4'] }}>{planAlternative}</Text>
        </Surface>
      ) : null}

      <View style={{ gap: tokens.spacing['8'] }}>
        {options.map((opt) => {
          const selected = selectedPlan === opt.id;
          return (
            <Pressable key={opt.id} onPress={() => setSelectedPlan(opt.id)}>
              <Surface
                radius="md"
                bordered
                style={{
                  padding: tokens.spacing['12'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: tokens.spacing['12'],
                  borderColor: selected ? colors.indigo : colors.border,
                  borderWidth: selected ? 1.5 : 1,
                }}
              >
                <Icon name={opt.icon as IconName} size={20} color={selected ? colors.indigo : colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text variant="label">{opt.label}</Text>
                  {opt.id === 'reason' && reasonText ? (
                    <Text variant="caption" color="secondary">{reasonText}</Text>
                  ) : (
                    <Text variant="caption" color="secondary">{opt.description}</Text>
                  )}
                </View>
              </Surface>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Devam et" onPress={onNext} />
      </View>
    </View>
  );
}

function ClosureStep({ onOutcome }: { onOutcome: (o: EventOutcome) => void }) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text variant="headline">Şimdi nasılsın?</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Ne olursa olsun, burada olman değerli.
      </Text>
      <View style={{ gap: tokens.spacing['12'] }}>
        <Button label="Geçti" onPress={() => onOutcome('passed')} />
        <Button label="Erteledim" variant="secondary" onPress={() => onOutcome('delayed')} />
        <Button label="Yaptım" variant="ghost" onPress={() => onOutcome('acted')} />
        <Button label="Emin değilim" variant="ghost" onPress={() => onOutcome('unsure')} />
      </View>
    </View>
  );
}

function HelpStep({ onBack }: { onBack: () => void }) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text variant="headline">Kriz desteği</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['12'] }}>
        Bu uygulama bir kriz hizmeti değildir. Kendine veya başkasına zarar verme riski, ya da güvende kalamama hissi
        yaşıyorsan lütfen bölgendeki acil yardım hattını ara ya da güvendiğin biriyle şimdi iletişime geç.
      </Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['12'] }}>
        Yalnız kalma. Bu an geçicidir ve yardım istemek güçlü bir adımdır.
      </Text>
      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Geri dön" variant="secondary" onPress={onBack} />
      </View>
    </View>
  );
}
