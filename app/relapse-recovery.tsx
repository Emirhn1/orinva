import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ModalShell, Text, Button, Surface } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { computeJourneySummary } from '@/utils/journey';

type Step = 'welcome' | 'next' | 'reason';

export default function RelapseRecoveryScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId: string; eventId?: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const events = useAppStore((s) => s.events);
  const reasons = useAppStore((s) => s.reasons);
  const logEvent = useAppStore((s) => s.logEvent);
  const closeEvent = useAppStore((s) => s.closeEvent);

  const behavior = behaviors.find((b) => b.id === params.behaviorId) ?? behaviors[0];
  const [step, setStep] = useState<Step>('welcome');
  const [recorded, setRecorded] = useState(false);

  const reason = reasons.find((r) => r.type === 'reason' && (r.behaviorId === behavior?.id || r.behaviorId === null));

  useEffect(() => {
    if (!behavior || recorded) return;
    if (params.eventId) {
      closeEvent(params.eventId, 'acted');
    } else {
      logEvent({ behaviorId: behavior.id, kind: 'acted', outcome: 'acted' });
    }
    setRecorded(true);
  }, [behavior]);

  const summary = useMemo(() => computeJourneySummary(events.filter((e) => e.behaviorId === behavior?.id)), [events, behavior]);

  if (!behavior) return null;

  const finish = () => router.replace('/(tabs)/today');

  return (
    <ModalShell onClose={finish}>
      {step === 'welcome' && (
        <View>
          <Text variant="headline">Bunu kaydetmen değerli</Text>
          <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['12'] }}>
            Bu tek olay yolculuğunun tamamı değil.
          </Text>
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['24'] }}>
            <Text variant="body" color="secondary">
              Son 30 günde {summary.contactDays} gün planınla temas ettin
              {summary.resistedOrDelayed > 0 ? `, ${summary.resistedOrDelayed} kez kısa bir ara sana yardımcı oldu` : ''}.
            </Text>
          </Surface>
          <View style={{ marginTop: tokens.spacing['32'] }}>
            <Button label="Devam et" onPress={() => setStep('next')} />
          </View>
        </View>
      )}

      {step === 'next' && (
        <View>
          <Text variant="headline">Şimdi ne yardımcı olur?</Text>
          <View style={{ marginTop: tokens.spacing['24'], gap: tokens.spacing['12'] }}>
            {reason ? <Button label="Nedenimi gör" variant="secondary" onPress={() => setStep('reason')} /> : null}
            <Button
              label="Kısaca not al"
              variant="secondary"
              onPress={() => router.replace({ pathname: '/(tabs)/journal/new', params: { behaviorId: behavior.id } })}
            />
            <Button label="Şimdilik kapat" variant="ghost" onPress={finish} />
          </View>
        </View>
      )}

      {step === 'reason' && (
        <View>
          <Text variant="headline">Senin nedenin</Text>
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginTop: tokens.spacing['20'] }}>
            <Text variant="bodyLarge" serif>{reason?.text}</Text>
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
