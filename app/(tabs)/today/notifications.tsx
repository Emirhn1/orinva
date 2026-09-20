import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, IconButton, EmptyState, Card, Surface, Button } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { KIND_LABEL } from '@/notifications/prefs';
import { formatClock } from '@/utils/date';

/** The bell on Today: what ORINVA is planning to say next, and where to change it. */
export default function NotificationsScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const prefs = useAppStore((s) => s.notificationPrefs);
  const plan = useAppStore((s) => s.notificationPlan);
  const upcoming = useMemo(() => plan.filter((p) => p.at.getTime() > Date.now()), [plan]);

  return (
    <ScreenContainer edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title" style={{ flex: 1 }}>
          Sıradakiler
        </Text>
        <IconButton name="sliders" accessibilityLabel="Bildirim ayarları" onPress={() => router.push('/(tabs)/you/notifications')} />
      </View>

      {!prefs.enabled ? (
        <Card padded>
          <EmptyState icon="bell" title="Bildirimler kapalı" description="Günün sözü, kilometre taşları ve nazik hatırlatmalar için aç." actionLabel="Bildirimleri aç" onAction={() => router.push('/(tabs)/you/notifications')} />
        </Card>
      ) : upcoming.length === 0 ? (
        <Card padded>
          <EmptyState icon="bell" title="Henüz planlanmış bildirim yok" description="Plan uygulama açıldığında hazırlanır." actionLabel="Ayarlara git" onAction={() => router.push('/(tabs)/you/notifications')} />
        </Card>
      ) : (
        <View style={{ gap: tokens.spacing['8'] }}>
          {upcoming.map((p) => (
            <Pressable key={p.key} onPress={() => (p.quoteId ? router.push({ pathname: '/quote/[id]', params: { id: p.quoteId } }) : undefined)} disabled={!p.quoteId}>
              <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'] }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.spacing['4'] }}>
                  <Text variant="caption" color="secondary">
                    {KIND_LABEL[p.kind].title}
                  </Text>
                  <Text variant="caption" color="tertiary" tabular>
                    {p.at.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })} · {formatClock(p.at.toISOString())}
                  </Text>
                </View>
                <Text variant="body">{p.body}</Text>
              </Surface>
            </Pressable>
          ))}
          <View style={{ marginTop: tokens.spacing['12'] }}>
            <Button label="Bildirim ayarları" variant="secondary" onPress={() => router.push('/(tabs)/you/notifications')} />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
