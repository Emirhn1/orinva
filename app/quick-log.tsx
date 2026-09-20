import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Text, Button, CravingSelector, MoodSelector, Input } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { EventKind } from '@/data/types';

export default function QuickLogSheet() {
  const router = useRouter();
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId: string; kind?: string }>();
  const allBehaviors = useAppStore((s) => s.behaviors);
  const logEvent = useAppStore((s) => s.logEvent);
  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);

  const behaviorId = params.behaviorId || behaviors[0]?.id;
  const behavior = behaviors.find((b) => b.id === behaviorId);

  const [kind, setKind] = useState<EventKind | null>(params.kind === 'urge' ? 'urge' : params.kind === 'resisted' ? 'resisted' : null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [savedEventId, setSavedEventId] = useState<string | null>(null);

  const close = () => router.back();

  const chooseKind = (k: EventKind) => {
    if (k === 'acted' && behaviorId) {
      router.replace({ pathname: '/relapse-recovery', params: { behaviorId } });
      return;
    }
    setKind(k);
  };

  const save = () => {
    if (!behaviorId || !kind) return;
    const event = logEvent({
      behaviorId,
      kind,
      intensity,
      mood,
      note: note.trim() || null,
      outcome: kind === 'resisted' ? 'passed' : null,
    });
    setSavedEventId(event.id);
  };

  if (!behavior) return null;

  if (savedEventId) {
    return (
      <Sheet onClose={close}>
        <Text variant="title">Kaydedildi</Text>
        <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
          İstersen şimdi 30 saniye durabiliriz.
        </Text>
        <View style={{ gap: tokens.spacing['12'] }}>
          <Button
            label="Zor an desteği aç"
            onPress={() => router.replace({ pathname: '/craving-help', params: { behaviorId, eventId: savedEventId } })}
          />
          <Button label="Kapat" variant="ghost" onPress={close} />
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet onClose={close}>
      <Text variant="title">{behavior.name}</Text>
      {!kind ? (
        <View style={{ marginTop: tokens.spacing['16'], gap: tokens.spacing['12'] }}>
          <Button label="Dürtü geldi" onPress={() => chooseKind('urge')} />
          <Button label="Direndim" variant="secondary" onPress={() => chooseKind('resisted')} />
          <Button label="Yaptım" variant="ghost" onPress={() => chooseKind('acted')} />
        </View>
      ) : (
        <View style={{ marginTop: tokens.spacing['16'], gap: tokens.spacing['20'] }}>
          <View>
            <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>Şu an ne kadar zor? (opsiyonel)</Text>
            <CravingSelector value={intensity} onChange={setIntensity} />
          </View>
          <View>
            <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>Nasıl hissediyorsun? (opsiyonel)</Text>
            <MoodSelector value={mood} onChange={setMood} />
          </View>
          <Input placeholder="Kısa bir not (opsiyonel)" value={note} onChangeText={setNote} />
          <Button label="Kaydet" onPress={save} />
        </View>
      )}
    </Sheet>
  );
}
