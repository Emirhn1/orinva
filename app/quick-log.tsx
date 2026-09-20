import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Sheet, SheetActions, Text, Button, CravingSelector, MoodSelector, Input, ChipGroup, OutcomePicker, Chip, Surface } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { EventOutcome, EventSource } from '@/data/types';
import { TRIGGER_CHIPS, LOCATION_CHIPS, COMPANY_CHIPS } from '@/content/chips';
import { usageKey } from '@/utils/chips';

type Stage = 'form' | 'saved';

export default function QuickLogSheet() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId?: string; outcome?: string; source?: string }>();
  const allBehaviors = useAppStore((s) => s.behaviors);
  const reasons = useAppStore((s) => s.reasons);
  const logEvent = useAppStore((s) => s.logEvent);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);

  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);
  const [behaviorId, setBehaviorId] = useState<string | undefined>(params.behaviorId || behaviors[0]?.id);
  const behavior = behaviors.find((b) => b.id === behaviorId);

  const presetOutcome = (['resisted', 'delayed', 'acted'].includes(params.outcome ?? '') ? params.outcome : null) as EventOutcome;
  const source = (params.source as EventSource) || 'app';

  const [stage, setStage] = useState<Stage>('form');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<EventOutcome>(presetOutcome);
  const [note, setNote] = useState('');
  const [more, setMore] = useState(false);
  const [savedEventId, setSavedEventId] = useState<string | null>(null);

  const reason = useMemo(
    () => reasons.find((r) => r.type === 'reason' && (r.behaviorId === behavior?.id || r.behaviorId === null)),
    [reasons, behavior]
  );

  const close = () => router.back();

  const save = () => {
    if (!behaviorId) return;
    const event = logEvent({
      behaviorId,
      intensity,
      mood,
      triggers,
      location,
      company,
      note: note.trim() || null,
      outcome,
      source,
    });

    bumpChipUsage([
      ...triggers.map((t) => usageKey('trigger', t)),
      ...(location ? [usageKey('location', location)] : []),
      ...(company ? [usageKey('company', company)] : []),
    ]);

    if (outcome === 'acted') {
      // §41: no haptic on a slip — acknowledgment, not a buzz.
      router.replace({ pathname: '/relapse-recovery', params: { behaviorId, eventId: event.id } });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    if (outcome === 'resisted') {
      // Sheet closes → the undo lives in the global toast (H15).
      toast.show({
        message: 'Kaydedildi',
        tone: 'success',
        actionLabel: 'Geri al',
        durationMs: tokens.motion.undoWindow,
        onAction: () => removeEvent(event.id),
      });
      close();
      return;
    }
    // Sheet stays open → undo is inline so it never covers the next action.
    setSavedEventId(event.id);
    setStage('saved');
  };

  const undoSaved = () => {
    if (savedEventId) removeEvent(savedEventId);
    toast.show({ message: 'Geri alındı', icon: 'refresh-cw' });
    close();
  };

  if (!behavior) return null;

  if (stage === 'saved' && savedEventId) {
    return (
      <Sheet onClose={close} title={outcome === 'delayed' ? 'Ertelemeyi kaydettim' : 'Kaydedildi'} subtitle="Şimdi ne yardımcı olur?">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
          <Icon name="check" size={18} color={colors.success} />
          <Text variant="caption" color="secondary" style={{ flex: 1 }}>
            Kayıt eklendi.
          </Text>
          <Text variant="label" color="indigo" onPress={undoSaved} accessibilityRole="button">
            Geri al
          </Text>
        </View>
        {reason ? (
          <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginBottom: tokens.spacing['16'] }}>
            <Text variant="caption" color="tertiary">
              Senin nedenin
            </Text>
            <Text variant="bodyLarge" serif style={{ marginTop: tokens.spacing['4'] }}>
              {reason.text}
            </Text>
          </Surface>
        ) : null}
        <View style={{ gap: tokens.spacing['12'] }}>
          <Button
            label="Dalgayı bekle · 3 dk"
            onPress={() => router.replace({ pathname: '/wave-mode', params: { behaviorId, eventId: savedEventId, intensity: intensity ?? '' } })}
          />
          <Button
            label={outcome === 'delayed' ? 'Sayaç başlat' : 'Ertele · sayaç'}
            variant="secondary"
            onPress={() => router.replace({ pathname: '/delay-timer', params: { behaviorId, eventId: savedEventId } })}
          />
          <Button label="Şimdilik kapat" variant="ghost" onPress={close} />
        </View>
        <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['16'] }}>
          Sonucu sonradan Günlük'ten güncelleyebilirsin.
        </Text>
      </Sheet>
    );
  }

  return (
    <Sheet onClose={close} title="Dürtü geldi" subtitle="Hiçbir şey seçmeden kaydetmek de geçerli.">
      {behaviors.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: tokens.spacing['8'], paddingBottom: tokens.spacing['16'] }}>
          {behaviors.map((b) => (
            <Chip key={b.id} label={b.name} selected={b.id === behaviorId} onPress={() => setBehaviorId(b.id)} tone="slateBlue" />
          ))}
        </ScrollView>
      ) : (
        <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['16'] }}>
          {behavior.name}
        </Text>
      )}

      <View style={{ gap: tokens.spacing['20'] }}>
        <View>
          <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
            Ne kadar zor?
          </Text>
          <CravingSelector value={intensity} onChange={(v) => setIntensity(intensity === v ? null : v)} />
        </View>

        <ChipGroup mode="multi" label="Tetikleyici?" options={TRIGGER_CHIPS} namespace="trigger" value={triggers} onChange={setTriggers} allowCustom customPlaceholder="Başka bir tetikleyici…" />

        <ChipGroup mode="single" label="Neredeydin?" options={LOCATION_CHIPS} namespace="location" value={location} onChange={setLocation} tone="slateBlue" />

        <View>
          <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
            Sonuç?{' '}
            <Text variant="caption" color="tertiary">
              şimdi ya da sonra
            </Text>
          </Text>
          <OutcomePicker value={outcome} onChange={setOutcome} />
        </View>

        {!more ? (
          <Text variant="label" color="indigo" onPress={() => setMore(true)} accessibilityRole="button">
            Daha fazla detay
          </Text>
        ) : (
          <>
            <View>
              <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
                Nasıl hissediyorsun?
              </Text>
              <MoodSelector value={mood} onChange={setMood} />
            </View>
            <ChipGroup mode="single" label="Kiminle?" options={COMPANY_CHIPS} namespace="company" value={company} onChange={setCompany} tone="violet" />
            <Input placeholder="Eklemek istediğin bir şey? (opsiyonel)" value={note} onChangeText={setNote} maxLength={200} />
          </>
        )}
      </View>

      <SheetActions>
        <View style={{ flex: 1 }}>
          <Button label="Kaydet" onPress={save} haptic="none" />
        </View>
      </SheetActions>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['8'], marginTop: tokens.spacing['12'] }}>
        <Icon name="info" size={14} color={colors.textTertiary} />
        <Text variant="caption" color="tertiary">
          Kayıttan sonra 5 saniye içinde geri alabilirsin.
        </Text>
      </View>
    </Sheet>
  );
}
