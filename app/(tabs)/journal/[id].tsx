import React from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Text, IconButton } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { formatClock, formatRelativeTime } from '@/utils/date';

export default function JournalEntryDetail() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useAppStore((s) => s.journalEntries);
  const removeJournalEntry = useAppStore((s) => s.removeJournalEntry);

  const entry = entries.find((e) => e.id === id);
  if (!entry) return null;

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text
          variant="caption"
          color="terracotta"
          onPress={() => {
            removeJournalEntry(entry.id);
            router.back();
          }}
        >
          Sil
        </Text>
      </View>
      <Text variant="title" serif>
        {formatRelativeTime(entry.createdAt)} · {formatClock(entry.createdAt)}
      </Text>
      <Text variant="bodyLarge" style={{ marginTop: tokens.spacing['16'] }}>
        {entry.text}
      </Text>
    </ScreenContainer>
  );
}
