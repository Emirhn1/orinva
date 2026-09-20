import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, EmptyState } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { formatRelativeTime } from '@/utils/date';

export default function JournalScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const entries = useAppStore((s) => s.journalEntries);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <Text variant="headline">Günlük</Text>
        <IconButton name="plus" accessibilityLabel="Yeni not" onPress={() => router.push('/(tabs)/journal/new')} />
      </View>

      {entries.length === 0 ? (
        <EmptyState
          icon="book-open"
          title="Henüz bir şey yazmadın"
          description="İstediğinde, istediğin kadar."
          actionLabel="Yeni not"
          onAction={() => router.push('/(tabs)/journal/new')}
        />
      ) : (
        <View style={{ gap: tokens.spacing['12'] }}>
          {entries.map((entry) => (
            <Pressable key={entry.id} onPress={() => router.push({ pathname: '/(tabs)/journal/[id]', params: { id: entry.id } })}>
              <Card padded>
                <Text variant="body" numberOfLines={2}>{entry.text}</Text>
                <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['8'] }}>
                  {formatRelativeTime(entry.createdAt)}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
