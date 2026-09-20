import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer, Text, Card, Button, IconButton, Metric, Badge, EmptyState, ProgressRing } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore, checkMilestonesForBehavior } from '@/store/useAppStore';
import { cleanDuration, nextMilestone } from '@/utils/journey';
import { formatRelativeTime, timeOfDayGreeting, todayKey } from '@/utils/date';
import { dailyContentFor, questionForDate } from '@/content/library';

const GREETING: Record<string, string> = {
  morning: 'Günaydın',
  day: 'İyi günler',
  evening: 'İyi akşamlar',
  night: 'İyi geceler',
};

export default function TodayScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const allBehaviors = useAppStore((s) => s.behaviors);
  const events = useAppStore((s) => s.events);
  const reasons = useAppStore((s) => s.reasons);
  const checkins = useAppStore((s) => s.checkins);

  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);
  const todaysCheckIn = useMemo(() => checkins.find((c) => c.date === todayKey()) ?? null, [checkins]);
  const behaviorIds = useMemo(() => behaviors.map((b) => b.id).join(','), [behaviors]);

  useFocusEffect(
    React.useCallback(() => {
      behaviors.forEach((b) => checkMilestonesForBehavior(b.id));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behaviorIds])
  );

  const primary = behaviors[0] ?? null;
  const timeOfDay = timeOfDayGreeting();
  const contentSlot = timeOfDay === 'evening' || timeOfDay === 'night' ? 'evening' : 'morning';

  const content = dailyContentFor(primary?.category ?? 'general', contentSlot);
  const reason = useMemo(
    () => reasons.find((r) => r.type === 'reason' && (r.behaviorId === primary?.id || r.behaviorId === null)),
    [reasons, primary]
  );

  const lastEvent = useMemo(
    () => (primary ? events.find((e) => e.behaviorId === primary.id) : undefined),
    [events, primary]
  );

  if (!primary) {
    return (
      <ScreenContainer>
        <EmptyState icon="compass" title="Henüz bir odak yok" description="Bir davranış ekleyerek başlayabilirsin." />
      </ScreenContainer>
    );
  }

  const duration = cleanDuration(primary);
  const upcoming = nextMilestone(duration.totalHours);
  const ringProgress = upcoming ? Math.min(1, duration.totalHours / upcoming.hours) : 1;
  const savedAmount = primary.costPerUnit ? (duration.totalHours / 24) * primary.costPerUnit : null;

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <Text variant="headline">{GREETING[timeOfDay]}</Text>
        <IconButton name="bell" accessibilityLabel="Bildirimler" onPress={() => router.push('/(tabs)/today/notifications')} />
      </View>

      {/* Hero: durum + clean time + ilerleme tek kartta — kart mezarlığı yaratmamak için */}
      <Card hero>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['16'] }}>
          <ProgressRing progress={ringProgress} size={92} color={colors.cyan}>
            <Text variant="statSmall" tabular>{duration.days}</Text>
            <Text variant="caption" color="tertiary">gün</Text>
          </ProgressRing>
          <View style={{ flex: 1 }}>
            <Badge label={primary.name} tone="slateBlue" />
            <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'] }}>
              {duration.days} gün {duration.hours} sa temiz
            </Text>
            {upcoming ? (
              <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
                Sonraki milestone: {upcoming.label}
              </Text>
            ) : null}
          </View>
        </View>

        {savedAmount !== null ? (
          <View style={{ flexDirection: 'row', gap: tokens.spacing['32'], marginTop: tokens.spacing['20'] }}>
            <Metric value={`~${Math.round(savedAmount)} ${primary.costCurrency ?? '₺'}`} label="tahmini tasarruf" />
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['20'] }}>
          <View style={{ flex: 1 }}>
            <Button label="Dürtü geldi" variant="secondary" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: primary.id, kind: 'urge' } })} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Yaptım" variant="ghost" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: primary.id, kind: 'acted' } })} />
          </View>
        </View>
      </Card>

      {/* Check-in — tek satır, cevaplanmışsa kompakt özet */}
      <Pressable onPress={() => router.push('/daily-checkin')} style={{ marginTop: tokens.spacing['16'] }}>
        <Card padded>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
            <View style={{ width: 36, height: 36, borderRadius: tokens.radius.xs, backgroundColor: colors.slateBlueSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text>{todaysCheckIn ? '✓' : '·'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {todaysCheckIn && !todaysCheckIn.skipped ? (
                <>
                  <Text variant="label">Bugünkü check-in tamamlandı</Text>
                  <Text variant="caption" color="secondary" numberOfLines={1}>{todaysCheckIn.answer || todaysCheckIn.question}</Text>
                </>
              ) : (
                <>
                  <Text variant="label">{questionForDate()}</Text>
                  <Text variant="caption" color="tertiary">Kendine bir dakika ayırmak ister misin?</Text>
                </>
              )}
            </View>
          </View>
        </Card>
      </Pressable>

      {/* Günün notu + kendi nedeni — tek kart */}
      <Card padded style={{ marginTop: tokens.spacing['16'] }}>
        <Text variant="body" style={{ fontStyle: 'italic' }}>{content.text}</Text>
        {reason ? (
          <View style={{ marginTop: tokens.spacing['16'], paddingTop: tokens.spacing['16'], borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text variant="caption" color="tertiary">Senin nedenin</Text>
            <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>{reason.text}</Text>
          </View>
        ) : null}
      </Card>

      {lastEvent ? (
        <Pressable onPress={() => router.push('/(tabs)/journal')} style={{ marginTop: tokens.spacing['16'] }}>
          <Text variant="caption" color="tertiary">
            Son kayıt · {formatRelativeTime(lastEvent.startedAt)}
          </Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}
