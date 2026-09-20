import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, SectionHeader, Badge, EmptyState, IconButton } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { computeJourneySummary, cleanDuration } from '@/utils/journey';

export default function JourneyScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const allBehaviors = useAppStore((s) => s.behaviors);
  const events = useAppStore((s) => s.events);
  const milestones = useAppStore((s) => s.milestones);

  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);
  const summary = useMemo(() => computeJourneySummary(events), [events]);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <Text variant="headline">Yolculuk</Text>
        <IconButton name="plus" accessibilityLabel="Yeni davranış ekle" onPress={() => router.push('/behavior-builder')} />
      </View>

      <Card hero>
        <Text variant="title">Son 30 gün</Text>
        <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'] }}>
          {summary.contactDays}/{summary.windowDays} gün planınla temas ettin.{' '}
          {summary.hardDays > 0 ? `${summary.hardDays} gün zordu. ` : ''}
          {summary.urgesLogged} dürtü kaydettin, {summary.resistedOrDelayed} tanesinde kısa bir ara yardımcı oldu.
        </Text>
      </Card>

      <View style={{ marginTop: tokens.spacing['24'] }}>
        <SectionHeader title="Davranışların" action={{ label: 'Tümü', onPress: () => router.push('/(tabs)/journey/behaviors') }} />
        {behaviors.length === 0 ? (
          <EmptyState icon="compass" title="Henüz davranış yok" actionLabel="Ekle" onAction={() => router.push('/behavior-builder')} />
        ) : (
          <View style={{ gap: tokens.spacing['12'] }}>
            {behaviors.map((b) => {
              const d = cleanDuration(b);
              return (
                <Pressable key={b.id} onPress={() => router.push({ pathname: '/(tabs)/journey/[id]', params: { id: b.id } })}>
                  <Card padded>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View>
                        <Text variant="label">{b.name}</Text>
                        <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
                          {d.days} gün {d.hours} sa temiz
                        </Text>
                      </View>
                      <Badge label={GOAL_LABEL[b.goalMode]} tone="slateBlue" />
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {milestones.length > 0 ? (
        <View style={{ marginTop: tokens.spacing['24'] }}>
          <SectionHeader title="Milestone'lar" />
          <View style={{ gap: tokens.spacing['8'] }}>
            {milestones.slice(0, 5).map((m) => (
              <Card key={m.id} padded>
                <Text variant="label">{m.label}</Text>
                <Text variant="caption" color="tertiary">{behaviors.find((b) => b.id === m.behaviorId)?.name}</Text>
              </Card>
            ))}
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const GOAL_LABEL: Record<string, string> = {
  quit: 'Bırak',
  reduce: 'Azalt',
  delay: 'Geciktir',
  notice: 'Fark et',
};
