import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, Metric, SectionHeader, EmptyState, Badge } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cleanDuration } from '@/utils/journey';
import { formatRelativeTime } from '@/utils/date';

const OUTCOME_LABEL: Record<string, string> = {
  passed: 'Geçti',
  delayed: 'Erteledi',
  acted: 'Yaptı',
  unsure: 'Emin değil',
};

export default function BehaviorDetailScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const allEvents = useAppStore((s) => s.events);
  const allReasons = useAppStore((s) => s.reasons);
  const archiveBehavior = useAppStore((s) => s.archiveBehavior);

  const events = useMemo(() => allEvents.filter((e) => e.behaviorId === id), [allEvents, id]);
  const reasons = useMemo(() => allReasons.filter((r) => r.behaviorId === id), [allReasons, id]);
  const behavior = behaviors.find((b) => b.id === id);
  if (!behavior) {
    return (
      <ScreenContainer>
        <EmptyState icon="compass" title="Davranış bulunamadı" />
      </ScreenContainer>
    );
  }

  const d = cleanDuration(behavior);
  const saved = behavior.costPerUnit ? (d.totalHours / 24) * behavior.costPerUnit : null;

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">{behavior.name}</Text>
      </View>

      <Card hero>
        <Text variant="statLarge" tabular>{d.days}</Text>
        <Text variant="caption" color="tertiary">gün temiz · {d.hours} sa {d.minutes} dk</Text>
        <View style={{ flexDirection: 'row', gap: tokens.spacing['32'], marginTop: tokens.spacing['20'] }}>
          {saved !== null ? <Metric value={`~${Math.round(saved)} ${behavior.costCurrency ?? '₺'}`} label="tasarruf" /> : null}
          <Metric value={String(events.length)} label="toplam kayıt" />
        </View>
      </Card>

      {behavior.planAlternative ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          <SectionHeader title="Planın" />
          <Text variant="body" color="secondary">{behavior.planAlternative}</Text>
        </Card>
      ) : null}

      {reasons.length > 0 ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          <SectionHeader title="Nedenlerin" />
          {reasons.map((r) => (
            <Text key={r.id} variant="body" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
              {r.text}
            </Text>
          ))}
        </Card>
      ) : null}

      <View style={{ marginTop: tokens.spacing['24'] }}>
        <SectionHeader title="Geçmiş" />
        {events.length === 0 ? (
          <EmptyState icon="clock" title="Henüz kayıt yok" />
        ) : (
          <View style={{ gap: tokens.spacing['8'] }}>
            {events.slice(0, 20).map((e) => (
              <Card key={e.id} padded>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text variant="label">{KIND_LABEL[e.kind]}</Text>
                    <Text variant="caption" color="tertiary">{formatRelativeTime(e.startedAt)}</Text>
                  </View>
                  {e.outcome ? <Badge label={OUTCOME_LABEL[e.outcome] ?? e.outcome} tone={e.outcome === 'acted' ? 'terracotta' : 'success'} /> : null}
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <View style={{ marginTop: tokens.spacing['24'] }}>
        <Text variant="caption" color="tertiary" onPress={() => archiveBehavior(behavior.id)}>
          Bu davranışı arşivle
        </Text>
      </View>
    </ScreenContainer>
  );
}

const KIND_LABEL: Record<string, string> = {
  urge: 'Dürtü',
  acted: 'Yaptım',
  resisted: 'Direndim',
};
