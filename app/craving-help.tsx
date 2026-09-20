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

type Step = 'notice' | 'plan' | 'closure' | 'help';

/**
 * Zor An — the one flow the whole app is judged on. Three decisions max:
 * how strong is it → what helps right now → how are you now.
 * Wave mode and the delay timer are real screens; this flow hands off to them.
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

  const [step, setStep] = useState<Step>('notice');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);

  useEffect(() => {
    if (!eventId && behavior) {
      const event = logEvent({ behaviorId: behavior.id, source: 'craving_help' });
      setEventId(event.id);
    }
  }, [behavior]);

  const stepIndex = { notice: 0, plan: 1, closure: 2, help: 2 }[step];

  const persistNotice = () => {
    if (eventId) updateEvent(eventId, { intensity, triggers });
    bumpChipUsage(triggers.map((t) => usageKey('trigger', t)));
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

  const finish = (outcome: EventOutcome) => {
    if (!behavior) return;
    if (outcome === 'acted') {
      router.replace({ pathname: '/relapse-recovery', params: { behaviorId: behavior.id, eventId: eventId ?? '' } });
      return;
    }
    if (eventId) closeEvent(eventId, outcome, { helpedByPlan: selectedPlan });
    if (outcome === 'resisted') toast.show({ message: 'Geçti. Kaydettim.', tone: 'success' });
    router.replace('/(tabs)/today');
  };

  if (!behavior) return null;

  const footer = (
    <Text variant="caption" color="tertiary" onPress={() => setStep('help')} accessibilityRole="button">
      Kriz desteği
    </Text>
  );

  return (
    <ModalShell onClose={() => router.back()} progress={(stepIndex + 1) / 3} footer={footer}>
      {step === 'notice' && (
        <View>
          <Text variant="headline">Şu an dürtü var</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
            Burada olduğun için iyi. İstersen işaretle, istersen doğrudan devam et.
          </Text>
          <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
            Ne kadar zor?
          </Text>
          <CravingSelector value={intensity} onChange={(v) => setIntensity(intensity === v ? null : v)} />
          <View style={{ marginTop: tokens.spacing['24'] }}>
            <ChipGroup mode="multi" label="Tetikleyici?" options={TRIGGER_CHIPS} namespace="trigger" value={triggers} onChange={setTriggers} max={3} />
          </View>
          <View style={{ marginTop: tokens.spacing['32'] }}>
            <Button
              label="Devam et"
              onPress={() => {
                persistNotice();
                setStep('plan');
              }}
            />
          </View>
        </View>
      )}

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

      {step === 'closure' && <ClosureStep onOutcome={finish} />}
      {step === 'help' && <HelpStep onBack={() => setStep('closure')} />}
    </ModalShell>
  );
}

const HANDOFF_OPTIONS: { id: string; label: string; description: string; icon: IconName }[] = [
  { id: 'wave', label: 'Dalgayı bekle', description: '3 dakika. Dürtü yükselir, zirve yapar, geçer.', icon: 'wind' },
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
  const localOptions = MICRO_PLAN_OPTIONS.filter((o) => o.id !== 'delay' && o.id !== 'breathe' && (o.id !== 'reason' || reasonText));

  return (
    <View>
      <Text variant="headline">Şimdi ne yardımcı olur?</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        Kendi planın öncelikli. Birini seç, ya da kendi yolunu izle.
      </Text>

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

function ClosureStep({ onOutcome }: { onOutcome: (o: EventOutcome) => void }) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text variant="headline">Şimdi nasılsın?</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Ne olursa olsun, burada olman değerli.
      </Text>
      <View style={{ gap: tokens.spacing['12'] }}>
        <Button label="Geçti" onPress={() => onOutcome('resisted')} />
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
