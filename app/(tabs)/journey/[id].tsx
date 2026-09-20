import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, SectionHeader, EmptyState, ProgressRing, OutcomeBadge, Button, Chip } from '@/components/ui';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { JourneyAnalytics } from '@/components/journey/JourneyAnalytics';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cleanDuration, milestoneProgress, reachedMilestones, computeActedStats, actedSeries } from '@/utils/journey';
import { formatRelativeTime, formatDuration, formatRemaining } from '@/utils/date';
import { useNow } from '@/utils/useNow';
import { TRIGGER_CHIPS } from '@/content/chips';
import { GOAL_LABEL, actedVerbFor, actedNounFor } from '@/content/behaviors';
import { commitActed } from '@/utils/actedFlow';

export default function BehaviorDetailScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const now = useNow(60_000);
  const { id } = useLocalSearchParams<{ id: string }>();
  const behaviors = useAppStore((s) => s.behaviors);
  const allEvents = useAppStore((s) => s.events);
  const allReasons = useAppStore((s) => s.reasons);
  const unarchiveBehavior = useAppStore((s) => s.unarchiveBehavior);

  const events = useMemo(() => allEvents.filter((e) => e.behaviorId === id), [allEvents, id]);
  const reasons = useMemo(() => allReasons.filter((r) => r.behaviorId === id || r.behaviorId === null), [allReasons, id]);
  const behavior = behaviors.find((b) => b.id === id);

  if (!behavior) {
    return (
      <ScreenContainer>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'] }}>
          <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        </View>
        <EmptyState icon="compass" title="Davranış bulunamadı" actionLabel="Yolculuğa dön" onAction={() => router.replace('/(tabs)/journey')} />
      </ScreenContainer>
    );
  }

  const d = cleanDuration(behavior, now);
  const ms = milestoneProgress(d.totalHours);
  const reached = reachedMilestones(d.totalHours);
  const acted = computeActedStats(events, behavior, now);
  const week = actedSeries(events, behavior.id, 7, now);
  const weekMax = Math.max(1, ...week.map((w) => w.count));
  const overTarget = !!behavior.dailyTarget && acted.today > behavior.dailyTarget;

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title" numberOfLines={1} style={{ flex: 1 }}>
          {behavior.name}
        </Text>
        <IconButton name="edit-3" accessibilityLabel="Düzenle" onPress={() => router.push({ pathname: '/behavior-builder', params: { id: behavior.id } })} />
      </View>

      {behavior.archived ? (
        <Card padded style={{ marginBottom: tokens.spacing['16'] }}>
          <Text variant="label">Bu davranış arşivde</Text>
          <View style={{ marginTop: tokens.spacing['12'] }}>
            <Button label="Arşivden çıkar" variant="secondary" onPress={() => unarchiveBehavior(behavior.id)} />
          </View>
        </Card>
      ) : null}

      <Card hero>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['20'] }}>
          <ProgressRing progress={ms.progress} size={104} color={colors.cyan}>
            <Text variant="statLarge" tabular style={{ fontSize: 32, lineHeight: 34 }}>
              {d.days}
            </Text>
            <Text variant="caption" color="tertiary">
              gün
            </Text>
          </ProgressRing>
          <View style={{ flex: 1 }}>
            <Text variant="body" tabular>
              {formatDuration(d.totalMinutes, 'long')}
            </Text>
            <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
              {GOAL_LABEL[behavior.goalMode]}
            </Text>
            {ms.next ? (
              <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['8'] }} tabular>
                {ms.next.label} için {formatRemaining(ms.remainingMinutes)}
              </Text>
            ) : null}
          </View>
        </View>
        {reached.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'], marginTop: tokens.spacing['16'] }}>
            {reached.map((m) => (
              <Chip key={m.label} label={m.label} compact selected tone="amber" />
            ))}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['20'] }}>
          <View style={{ flex: 1 }}>
            <Button label="Dürtü geldi" variant="secondary" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: behavior.id } })} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Direndim" variant="ghost" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: behavior.id, outcome: 'resisted' } })} />
          </View>
        </View>
      </Card>

      {/* "Kaç tane?" — daily count, quick +1, 7-day bars */}
      {acted.week > 0 || behavior.dailyTarget ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text variant="label">Bugün</Text>
              <Text variant="statSmall" tabular style={{ marginTop: tokens.spacing['4'], color: overTarget ? colors.amber : undefined }}>
                {acted.today}
                {behavior.dailyTarget ? <Text variant="body" color="tertiary">{` / ${behavior.dailyTarget}`}</Text> : null}
              </Text>
              <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
                {actedNounFor(behavior.category)} · bu hafta {acted.week}
                {acted.avgPerDay !== null ? ` · günlük ort. ${acted.avgPerDay.toFixed(1)}` : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => commitActed(router, behavior)}
              accessibilityRole="button"
              accessibilityLabel={`Bir ${actedVerbFor(behavior.category).toLowerCase()} olarak kaydet`}
              style={{ minWidth: 44, minHeight: 44, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: tokens.spacing['16'] }}
            >
              <Text variant="label" color="indigo">
                + {actedVerbFor(behavior.category)}
              </Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: tokens.spacing['8'], marginTop: tokens.spacing['20'], height: 48 }}>
            {week.map((w) => (
              <View key={w.key} style={{ flex: 1, alignItems: 'center', gap: tokens.spacing['4'] }}>
                <View
                  style={{
                    width: '100%',
                    height: Math.max(3, (w.count / weekMax) * 36),
                    borderRadius: tokens.radius.xs,
                    backgroundColor: w.count > 0 ? (behavior.dailyTarget && w.count > behavior.dailyTarget ? colors.amber : colors.indigo) : colors.surfaceSecondary,
                    opacity: w.count > 0 ? 0.85 : 1,
                  }}
                />
                <Text variant="caption" color="tertiary" style={{ fontSize: 10 }}>
                  {w.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {behavior.planAlternative || reasons.length > 0 ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          {behavior.planAlternative ? (
            <View>
              <Text variant="caption" color="tertiary">
                Zor anda planın
              </Text>
              <Text variant="body" style={{ marginTop: tokens.spacing['4'] }}>
                {behavior.planAlternative}
              </Text>
            </View>
          ) : null}
          {reasons.length > 0 ? (
            <View style={{ marginTop: behavior.planAlternative ? tokens.spacing['16'] : 0 }}>
              <Text variant="caption" color="tertiary">
                Nedenlerin
              </Text>
              {reasons.slice(0, 3).map((r) => (
                <Text key={r.id} variant="body" serif style={{ marginTop: tokens.spacing['4'] }}>
                  {r.text}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      <View style={{ marginTop: tokens.spacing['16'] }}>
        <JourneyAnalytics events={events} behaviors={[behavior]} now={now} onLogPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: behavior.id } })} />
      </View>

      <View style={{ marginTop: tokens.spacing['24'] }}>
        <SectionHeader title="Geçmiş" />
        {events.length === 0 ? (
          <Card padded>
            <EmptyState icon="clock" title="Henüz kayıt yok" description="İlk kaydın buraya gelecek." actionLabel="Dürtü kaydet" onAction={() => router.push({ pathname: '/quick-log', params: { behaviorId: behavior.id } })} />
          </Card>
        ) : (
          <View style={{ gap: tokens.spacing['8'] }}>
            {events.slice(0, 30).map((e) => (
              <Pressable key={e.id} onPress={() => router.push({ pathname: '/event-detail', params: { id: e.id } })} accessibilityRole="button">
                <Card padded>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing['12'] }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="label">
                        {formatRelativeTime(e.startedAt)}
                        {e.intensity ? ` · şiddet ${e.intensity}` : ''}
                      </Text>
                      {e.triggers.length ? (
                        <Text variant="caption" color="tertiary" numberOfLines={1} style={{ marginTop: tokens.spacing['4'] }}>
                          {e.triggers.map((t) => resolveChipLabel(TRIGGER_CHIPS, t)).join(' · ')}
                        </Text>
                      ) : null}
                    </View>
                    <OutcomeBadge outcome={e.outcome} />
                    <Icon name="chevron-right" size={16} color={colors.textTertiary} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
