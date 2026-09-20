import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Text, IconButton, Button, Chip, EmptyState } from '@/components/ui';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { formatClock, formatRelativeTime } from '@/utils/date';
import { JOURNAL_TAG_CHIPS, MOOD_CHIPS } from '@/content/chips';

export default function JournalEntryDetail() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useAppStore((s) => s.journalEntries);
  const removeJournalEntry = useAppStore((s) => s.removeJournalEntry);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const [confirm, setConfirm] = useState(false);

  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return (
      <ScreenContainer>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <EmptyState icon="book-open" title="Not bulunamadı" actionLabel="Günlüğe dön" onAction={() => router.back()} />
      </ScreenContainer>
    );
  }

  const doDelete = () => {
    const snapshot = { ...entry };
    removeJournalEntry(entry.id);
    toast.show({
      message: 'Not silindi',
      icon: 'refresh-cw',
      actionLabel: 'Geri al',
      durationMs: tokens.motion.undoWindow,
      onAction: () => addJournalEntry({ text: snapshot.text, linkedEventId: snapshot.linkedEventId, tag: snapshot.tag, mood: snapshot.mood }),
    });
    router.back();
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
      </View>
      <Text variant="title" serif>
        {formatRelativeTime(entry.createdAt)} · {formatClock(entry.createdAt)}
      </Text>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['8'], marginTop: tokens.spacing['12'], flexWrap: 'wrap' }}>
        {entry.tag ? <Chip compact label={resolveChipLabel(JOURNAL_TAG_CHIPS, entry.tag) ?? entry.tag} selected tone="violet" /> : null}
        {entry.mood ? <Chip compact label={resolveChipLabel(MOOD_CHIPS, entry.mood) ?? entry.mood} /> : null}
      </View>
      <Text variant="bodyLarge" style={{ marginTop: tokens.spacing['20'] }}>
        {entry.text}
      </Text>
      {entry.linkedEventId ? (
        <Text variant="label" color="indigo" style={{ marginTop: tokens.spacing['20'] }} onPress={() => router.push({ pathname: '/event-detail', params: { id: entry.linkedEventId! } })} accessibilityRole="button">
          Bağlı istek kaydını aç
        </Text>
      ) : null}
      <View style={{ marginTop: tokens.spacing['40'] }}>
        {!confirm ? (
          <Button label="Bu notu sil" variant="critical" onPress={() => setConfirm(true)} />
        ) : (
          <View style={{ gap: tokens.spacing['8'] }}>
            <Button label="Evet, sil" variant="critical" onPress={doDelete} />
            <Button label="Vazgeç" variant="ghost" onPress={() => setConfirm(false)} />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
