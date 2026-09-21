import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ModalShell, Text, Button, CravingSelector, Surface, ChipGroup } from '@/components/ui';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { MICRO_PLAN_OPTIONS } from '@/content/library';
import { TRIGGER_CHIPS } from '@/content/chips';
import { usageKey } from '@/utils/chips';
import { EventOutcome } from '@/data/types';
import { commitActed } from '@/utils/actedFlow';

type Step = 'plan' | 'closure' | 'log' | 'help';

/**
 * Zor An — the one flow the whole app is judged on. The saved plan is the
 * very first thing shown; nothing gates it. Intensity/trigger detail is
 * optional and, when it's asked at all, it's asked after the intervention —
 * never before it.
 */
export default function CravingHelpScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId?: string; eventId?: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const reasons = useAppStore((s) => s.reasons);
  const logEvent = useAppStore((s) => s.logEvent);
  const closeEvent = useAppStore((s) => s.closeEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);

  const behavior = behaviors.find((b) => b.id === params.behaviorId) ?? behaviors.find((b) => !b.archived);
  const reason = useMemo(
    () => reasons.find((r) => r.type === 'reason' && (r.behaviorId === behavior?.id || r.behaviorId === null)),
    [reasons, behavior]
  );

  const [step, setStep] = useState<Step>('plan');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);
  const [pendingOutcome, setPendingOutcome] = useState<EventOutcome>(null);
  const [returnStep, setReturnStep] = useState<Step>('plan');

  useEffect(() => {
    if (!eventId && behavior) {
      const event = logEvent({ behaviorId: behavior.id, source: 'craving_help' });
      setEventId(event.id);
    }
  }, [behavior]);

  const stepIndex = { plan: 0, closure: 1, log: 2, help: 0 }[step === 'help' ? returnStep : step];

  const persistDetail = () => {
    if (eventId && (intensity !== null || triggers.length)) updateEvent(eventId, { intensity, triggers });
    if (triggers.length) bumpChipUsage(triggers.map((t) => usageKey('trigger', t)));
  };

  const choosePlan = (id: string) => {
    if (!behavior) return;
    setSelectedPlan(id);
    if (id === 'wave') {
      router.replace({ pathname: '/wave-mode', params: { behaviorId: behavior.id, eventId: eventId ?? '', intensity: intensity ?? '' } });
      return;
    }
    if (id === 'delay') {
      router.replace({ pathname: '/delay-timer', params: { behaviorId: behavior.id, eventId: eventId ?? '' } });
      return;
    }
    if (id === 'write') {
      if (eventId) updateEvent(eventId, { helpedByPlan: id });
      router.replace({ pathname: '/(tabs)/journal/new', params: { eventId: eventId ?? '' } });
      return;
    }
  };

  // Recording detail is optional and comes after the outcome, never before help.
  const finish = (outcome: EventOutcome) => {
    if (!behavior) return;
    if (outcome === 'acted') {
      commitActed(router, behavior, { eventId, source: 'craving_help', extra: { helpedByPlan: selectedPlan }, afterQuiet: () => router.replace('/(tabs)/today') });
      return;
    }
    if (eventId) closeEvent(eventId, outcome, { helpedByPlan: selectedPlan });
    setPendingOutcome(outcome);
    setStep('log');
  };

  const OUTCOME_MESSAGE: Partial<Record<NonNullable<EventOutcome>, string>> = {
    resisted: 'Geçti. Kaydettim.',
    delayed: 'Erteledin. Bu da bir kazanım — kaydettim.',
    unsure: 'Kaydettim. Emin olmasan da burada olman değerli.',
  };

  const finishLog = () => {
    persistDetail();
    const snapshot = eventId ? useAppStore.getState().events.find((event) => event.id === eventId) : undefined;
    toast.show({
      message: (pendingOutcome && OUTCOME_MESSAGE[pendingOutcome]) || 'Kaydettim.',
      tone: pendingOutcome === 'resisted' ? 'success' : 'neutral',
      actionLabel: 'Geri al',
      durationMs: tokens.motion.undoWindow,
      onAction: () => snapshot && updateEvent(snapshot.id, snapshot),
    });
    router.replace('/(tabs)/today');
  };

  if (!behavior) return null;

  const footer = (
    <Text
      variant="caption"
      color="tertiary"
      onPress={() => {
        setReturnStep(step);
        setStep('help');
      }}
      accessibilityRole="button"
    >
      Kriz desteği
    </Text>
  );

  return (
    <ModalShell onClose={() => router.back()} progress={(stepIndex + 1) / 3} footer={footer}>
      {step === 'plan' && (
        <PlanStep
          reasonText={reason?.text ?? null}
          selectedPlan={selectedPlan}
          onChoose={choosePlan}
          onSelectLocal={setSelectedPlan}
          planAlternative={behavior.planAlternative}
          onNext={() => setStep('closure')}
        />
      )}

      {step === 'closure' && <ClosureStep onOutcome={finish} resistedLabel={behavior.verbResist} actedLabel={behavior.verbDid} />}

      {step === 'log' && (
        <View>
          <Text variant="headline">İstersen ekle</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
            Bu tamamen isteğe bağlı — atlayabilirsin.
          </Text>
          <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
            Ne kadar zordu?
          </Text>
          <CravingSelector value={intensity} onChange={(v) => setIntensity(intensity === v ? null : v)} />
          <View style={{ marginTop: tokens.spacing['24'] }}>
            <ChipGroup mode="multi" label="Tetikleyici?" options={TRIGGER_CHIPS} namespace="trigger" value={triggers} onChange={setTriggers} max={3} />
          </View>
          <View style={{ marginTop: tokens.spacing['32'], gap: tokens.spacing['12'] }}>
            <Button label="Kaydet ve bitir" onPress={finishLog} />
            <Button label="Atla" variant="ghost" onPress={finishLog} />
          </View>
        </View>
      )}

      {step === 'help' && <HelpStep onBack={() => setStep(returnStep)} />}
    </ModalShell>
  );
}

const HANDOFF_OPTIONS: { id: string; label: string; description: string; icon: IconName }[] = [
  { id: 'wave', label: 'Dalgayı izle', description: '3 dakika. İstek bir dalga gibi yükselir, zirve yapar, geçer.', icon: 'wind' },
  { id: 'delay', label: 'Ertele', description: '2–20 dakika sonra tekrar sor.', icon: 'clock' },
];

function PlanStep({
  reasonText,
  selectedPlan,
  onChoose,
  onSelectLocal,
  planAlternative,
  onNext,
}: {
  reasonText: string | null;
  selectedPlan: string | null;
  onChoose: (id: string) => void;
  onSelectLocal: (id: string) => void;
  planAlternative?: string;
  onNext: () => void;
}) {
  const { colors, tokens } = useTheme();
  // 'delay' has its own handoff row above; everything else — breathing, non-breathing
  // calming, and reaching out — stays here as its own distinct, separately labeled option.
  const localOptions = MICRO_PLAN_OPTIONS.filter((o) => o.id !== 'delay' && (o.id !== 'reason' || reasonText));

  return (
    <View>
      <Text variant="headline">Şimdi ne yardımcı olur?</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        Kendi planın öncelikli. Birini seç, ya da kendi yolunu izle.
      </Text>

      {/* The saved personal plan is the first concrete thing shown — before the reason, before any handoff option. */}
      {planAlternative ? (
        <Pressable onPress={() => onSelectLocal('own')}>
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginBottom: tokens.spacing['16'], borderColor: selectedPlan === 'own' ? colors.indigo : colors.border, borderWidth: selectedPlan === 'own' ? 1.5 : 1 }}>
            <Text variant="caption" color="tertiary">
              Senin planın
            </Text>
            <Text variant="body" style={{ marginTop: tokens.spacing['4'] }}>
              {planAlternative}
            </Text>
          </Surface>
        </Pressable>
      ) : null}

      {reasonText ? (
        <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginBottom: tokens.spacing['16'], borderColor: colors.indigo }}>
          <Text variant="caption" color="tertiary">
            Senin nedenin
          </Text>
          <Text variant="bodyLarge" serif style={{ marginTop: tokens.spacing['4'] }}>
            {reasonText}
          </Text>
        </Surface>
      ) : null}

      <View style={{ gap: tokens.spacing['8'] }}>
        {HANDOFF_OPTIONS.map((opt) => (
          <OptionRow key={opt.id} icon={opt.icon} label={opt.label} description={opt.description} selected={false} accent onPress={() => onChoose(opt.id)} />
        ))}
        {localOptions.map((opt) => (
          <OptionRow
            key={opt.id}
            icon={opt.icon as IconName}
            label={opt.label}
            description={opt.id === 'reason' && reasonText ? reasonText : opt.description}
            selected={selectedPlan === opt.id}
            onPress={() => (opt.id === 'write' ? onChoose(opt.id) : onSelectLocal(opt.id))}
          />
        ))}
      </View>

      <View style={{ marginTop: tokens.spacing['32'] }}>
        <Button label="Devam et" onPress={onNext} />
      </View>
    </View>
  );
}

function OptionRow({ icon, label, description, selected, accent, onPress }: { icon: IconName; label: string; description: string; selected: boolean; accent?: boolean; onPress: () => void }) {
  const { colors, tokens } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }}>
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
          backgroundColor: accent ? colors.surfaceSecondary : undefined,
        }}
      >
        <Icon name={icon} size={20} color={selected || accent ? colors.indigo : colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text variant="label">{label}</Text>
          <Text variant="caption" color="secondary">
            {description}
          </Text>
        </View>
        {accent ? <Icon name="arrow-right" size={18} color={colors.textTertiary} /> : null}
      </Surface>
    </Pressable>
  );
}

function ClosureStep({ onOutcome, resistedLabel, actedLabel }: { onOutcome: (o: EventOutcome) => void; resistedLabel: string; actedLabel: string }) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text variant="headline">Şimdi nasılsın?</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Ne olursa olsun, burada olman değerli.
      </Text>
      <View style={{ gap: tokens.spacing['12'] }}>
        <Button label={resistedLabel} onPress={() => onOutcome('resisted')} />
        <Button label="Erteledim" variant="secondary" onPress={() => onOutcome('delayed')} />
        <Button label={actedLabel} variant="ghost" onPress={() => onOutcome('acted')} />
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
        Türkiye: 112 Acil · 182 ALO Sağlık · Yeşilay YEDAM 115 (bağımlılık danışma hattı).
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
