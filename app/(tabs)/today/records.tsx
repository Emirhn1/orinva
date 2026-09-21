import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, EmptyState, IconButton, ScreenContainer, Text } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { dayKey, todayKey } from '@/utils/date';

export default function TodayRecordsScreen() {
  const router = useRouter();
  const { behaviorId } = useLocalSearchParams<{ behaviorId: string }>();
  const { colors, tokens } = useTheme();
  const behaviors = useAppStore((s) => s.behaviors);
  const allEvents = useAppStore((s) => s.events);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const restoreEvent = useAppStore((s) => s.restoreEvent);
  const behavior = behaviors.find((item) => item.id === behaviorId);
  const events = useMemo(() => allEvents.filter((event) => event.behaviorId === behaviorId && event.outcome === 'acted' && dayKey(event.startedAt) === todayKey()), [allEvents, behaviorId]);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text variant="title">Bugünkü kayıtlar</Text>
          <Text variant="caption" color="tertiary">{behavior?.name ?? 'Takip alanı'} · {events.length} kayıt</Text>
        </View>
      </View>

      {!events.length ? (
        <Card padded><EmptyState icon="clock" title="Bugün kayıt yok" description="Yeni kayıtlar burada listelenecek." /></Card>
      ) : (
        <View style={{ gap: tokens.spacing['8'] }}>
          {events.map((event) => (
            <Card key={event.id} padded>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{behavior?.verbDid ?? 'Yaptım'}</Text>
                  <Text variant="caption" color="secondary">{new Date(event.startedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Pressable onPress={() => { removeEvent(event.id); toast.show({ message: 'Kayıt kaldırıldı', icon: 'info', actionLabel: 'Geri al', durationMs: tokens.motion.undoWindow, onAction: () => restoreEvent(event) }); }} accessibilityRole="button" accessibilityLabel="Kaydı kaldır" style={{ width: 48, height: 48, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="trash-2" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
