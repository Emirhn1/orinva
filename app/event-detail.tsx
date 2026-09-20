import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Sheet, SheetActions, Text, Button, CravingSelector, ChipGroup, OutcomePicker, Input, Chip } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { EventOutcome } from '@/data/types';
import { TRIGGER_CHIPS, LOCATION_CHIPS } from '@/content/chips';
import { formatClock, formatRelativeTime } from '@/utils/date';
import { commitActed } from '@/utils/actedFlow';

/**
 * H15 — every record can be corrected or removed later. Also where an "open"
 * urge gets its outcome once the user has calmed down.
 */
export default function EventDetailSheet() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const events = useAppStore((s) => s.events);
  const behaviors = useAppStore((s) => s.behaviors);
  const updateEvent = useAppStore((s) => s.updateEvent);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const logEvent = useAppStore((s) => s.logEvent);

  const event = events.find((e) => e.id === id);
  const behavior = behaviors.find((b) => b.id === event?.behaviorId);

  const [intensity, setIntensity] = useState<number | null>(event?.intensity ?? null);
  const [triggers, setTriggers] = useState<string[]>(event?.triggers ?? []);
  const [location, setLocation] = useState<string | null>(event?.location ?? null);
  const [outcome, setOutcome] = useState<EventOutcome>(event?.outcome ?? null);
  const [note, setNote] = useState(event?.note ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = () => router.back();

  if (!event || !behavior) return null;

  const save = () => {
    const outcomeChanged = outcome !== event.outcome;
    if (outcome === 'acted' && outcomeChanged) {
      updateEvent(event.id, { intensity, triggers, location, note: note.trim() || null });
      if (commitActed(router, behavior, { eventId: event.id }) === 'quiet') close();
      return;
    }
    updateEvent(event.id, {
      intensity,
      triggers,
      location,
      note: note.trim() || null,
      outcome,
      outcomeUpdatedAt: outcomeChanged ? new Date().toISOString() : event.outcomeUpdatedAt,
      endedAt: outcome && !event.endedAt ? new Date().toISOString() : event.endedAt,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toast.show({ message: 'Güncellendi', tone: 'success' });
    close();
  };

  const doDelete = () => {
    const snapshot = { ...event };
    removeEvent(event.id);
    toast.show({
      message: 'Kayıt silindi',
      icon: 'refresh-cw',
      actionLabel: 'Geri al',
      durationMs: tokens.motion.undoWindow,
      onAction: () => {
        // Re-create with the same content (new id); clean-time is recomputed by the store.
        logEvent({
          behaviorId: snapshot.behaviorId,
          intensity: snapshot.intensity,
          mood: snapshot.mood,
          triggers: snapshot.triggers,
          location: snapshot.location,
          company: snapshot.company,
          note: snapshot.note,
          outcome: snapshot.outcome,
          helpedByPlan: snapshot.helpedByPlan,
          delaySeconds: snapshot.delaySeconds,
          source: snapshot.source,
        });
      },
    });
    close();
  };

  return (
    <Sheet onClose={close} title={behavior.name} subtitle={`${formatRelativeTime(event.startedAt)} · ${formatClock(event.startedAt)}`}>
      <View style={{ gap: tokens.spacing['20'] }}>
        <View>
          <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
            Sonuç
          </Text>
          <OutcomePicker value={outcome} onChange={setOutcome} includeUnsure />
        </View>
        <View>
          <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
            Ne kadar zordu?
          </Text>
          <CravingSelector value={intensity} onChange={(v) => setIntensity(intensity === v ? null : v)} />
        </View>
        <ChipGroup mode="multi" label="Tetikleyici" options={TRIGGER_CHIPS} namespace="trigger" value={triggers} onChange={setTriggers} allowCustom />
        <ChipGroup mode="single" label="Nerede" options={LOCATION_CHIPS} namespace="location" value={location} onChange={setLocation} tone="slateBlue" />
        <Input placeholder="Not (opsiyonel)" value={note} onChangeText={setNote} maxLength={300} />
        {event.delaySeconds ? (
          <Chip compact label={`${Math.round(event.delaySeconds / 60)} dk erteledin`} />
        ) : null}
      </View>

      <SheetActions>
        <View style={{ flex: 1 }}>
          <Button label="Kaydet" onPress={save} />
        </View>
      </SheetActions>

      <View style={{ marginTop: tokens.spacing['16'] }}>
        {!confirmDelete ? (
          <Button label="Bu kaydı sil" variant="critical" onPress={() => setConfirmDelete(true)} />
        ) : (
          <View style={{ gap: tokens.spacing['8'] }}>
            <Button label="Evet, sil" variant="critical" onPress={doDelete} />
            <Button label="Vazgeç" variant="ghost" onPress={() => setConfirmDelete(false)} />
          </View>
        )}
      </View>
    </Sheet>
  );
}
