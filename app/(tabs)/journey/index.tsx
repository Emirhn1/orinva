import React, { useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, SectionHeader, Badge, EmptyState, IconButton, Chip } from '@/components/ui';
import { JourneyAnalytics } from '@/components/journey/JourneyAnalytics';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cleanDuration } from '@/utils/journey';
import { formatDuration } from '@/utils/date';
import { useNow } from '@/utils/useNow';
import { GOAL_LABEL } from '@/content/behaviors';

export default function JourneyScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const now = useNow(60_000);
  const allBehaviors = useAppStore((s) => s.behaviors);
  const allEvents = useAppStore((s) => s.events);
  const milestones = useAppStore((s) => s.milestones);

  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);
  const [filterId, setFilterId] = useState<string | null>(null);

  const scoped = useMemo(() => (filterId ? behaviors.filter((b) => b.id === filterId) : behaviors), [behaviors, filterId]);
  const events = useMemo(() => {
    const ids = new Set(scoped.map((b) => b.id));
    return allEvents.filter((e) => ids.has(e.behaviorId));
  }, [allEvents, scoped]);

  const recentMilestones = useMemo(() => milestones.filter((m) => behaviors.some((b) => b.id === m.behaviorId)).slice(0, 5), [milestones, behaviors]);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
        <Text variant="headline">Yolculuk</Text>
        <IconButton name="plus" accessibilityLabel="Yeni davranış ekle" onPress={() => router.push('/behavior-builder')} />
      </View>

      {behaviors.length === 0 ? (
        <Card padded>
          <EmptyState icon="compass" title="Henüz davranış yok" description="Bir davranış ekle; yolculuğun burada şekillenir." actionLabel="Davranış ekle" onAction={() => router.push('/behavior-builder')} />
        </Card>
      ) : (
        <>
          {behaviors.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -tokens.spacing['20'], marginBottom: tokens.spacing['16'] }} contentContainerStyle={{ paddingHorizontal: tokens.spacing['20'], gap: tokens.spacing['8'] }}>
              <Chip label="Tümü" selected={filterId === null} onPress={() => setFilterId(null)} compact tone="slateBlue" />
              {behaviors.map((b) => (
                <Chip key={b.id} label={b.name} selected={filterId === b.id} onPress={() => setFilterId(b.id)} compact tone="slateBlue" />
              ))}
            </ScrollView>
          ) : null}

          <JourneyAnalytics events={events} behaviors={scoped} now={now} onLogPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: scoped[0]?.id ?? '' } })} />

          <View style={{ marginTop: tokens.spacing['24'] }}>
            <SectionHeader title="Davranışların" action={{ label: 'Tümü', onPress: () => router.push('/(tabs)/journey/behaviors') }} />
            <View style={{ gap: tokens.spacing['12'] }}>
              {behaviors.map((b) => {
                const d = cleanDuration(b, now);
                return (
                  <Pressable key={b.id} onPress={() => router.push({ pathname: '/(tabs)/journey/[id]', params: { id: b.id } })} accessibilityRole="button" accessibilityLabel={b.name}>
                    <Card padded>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing['12'] }}>
                        <View style={{ flex: 1 }}>
                          <Text variant="label" numberOfLines={1}>
                            {b.name}
                          </Text>
                          <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'] }} tabular>
                            {formatDuration(d.totalMinutes, 'long')}
                          </Text>
                        </View>
                        <Badge label={GOAL_LABEL[b.goalMode]} tone="slateBlue" />
                        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {recentMilestones.length > 0 ? (
            <View style={{ marginTop: tokens.spacing['24'] }}>
              <SectionHeader title="Kilometre taşları" />
              <View style={{ gap: tokens.spacing['8'] }}>
                {recentMilestones.map((m) => (
                  <Card key={m.id} padded>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
                      <Icon name="award" size={20} color={colors.bronze} />
                      <View style={{ flex: 1 }}>
                        <Text variant="label">{m.label}</Text>
                        <Text variant="caption" color="tertiary">
                          {behaviors.find((b) => b.id === m.behaviorId)?.name}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}
