import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer, Text, Card, Button, IconButton, EmptyState, ProgressRing, Surface, OutcomeBadge } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore, checkMilestonesForBehavior } from '@/store/useAppStore';
import { cleanDuration, milestoneProgress, computeEarnings } from '@/utils/journey';
import { formatRelativeTime, timeOfDayGreeting, todayKey, formatDuration, formatRemaining, formatMoney, formatMinutesHuman, dayKey } from '@/utils/date';
import { useNow } from '@/utils/useNow';
import { questionForDate } from '@/content/library';
import { Quote, QUOTE_CATEGORY_LABEL } from '@/content/quotes';
import { Behavior } from '@/data/types';

const GREETING: Record<string, string> = {
  morning: 'Günaydın',
  day: 'İyi günler',
  evening: 'İyi akşamlar',
  night: 'İyi geceler',
};

export default function TodayScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const now = useNow(60_000);
  const allBehaviors = useAppStore((s) => s.behaviors);
  const events = useAppStore((s) => s.events);
  const reasons = useAppStore((s) => s.reasons);
  const checkins = useAppStore((s) => s.checkins);
  const settings = useAppStore((s) => s.settings);
  const quoteOfTheDay = useAppStore((s) => s.quoteOfTheDay);
  const quoteOfDay = useAppStore((s) => s.quoteOfDay);
  const quoteMeta = useAppStore((s) => s.quoteMeta);
  const toggleFavoriteQuote = useAppStore((s) => s.toggleFavoriteQuote);
  const [quote, setQuote] = useState<Quote | null>(null);

  // Picked once per local day (stored), never during render.
  useEffect(() => {
    setQuote(quoteOfTheDay());
  }, [quoteOfDay?.date, quoteOfDay?.id, quoteOfTheDay]);
  const quoteIsFavorite = !!quote && !!quoteMeta.find((m) => m.quoteId === quote.id)?.isFavorite;

  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);
  const todaysCheckIn = useMemo(() => checkins.find((c) => c.date === todayKey()) ?? null, [checkins]);
  const behaviorIds = useMemo(() => behaviors.map((b) => b.id).join(','), [behaviors]);

  // H14 — a focus card + the rest in a strip. Focus = the behavior with the most recent activity, else the first.
  const [focusId, setFocusId] = useState<string | null>(null);
  const focus: Behavior | null = useMemo(() => {
    if (!behaviors.length) return null;
    const chosen = behaviors.find((b) => b.id === focusId);
    if (chosen) return chosen;
    const latest = events.find((e) => behaviors.some((b) => b.id === e.behaviorId));
    return behaviors.find((b) => b.id === latest?.behaviorId) ?? behaviors[0];
  }, [behaviors, events, focusId]);

  useFocusEffect(
    React.useCallback(() => {
      behaviors.forEach((b) => checkMilestonesForBehavior(b.id));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behaviorIds])
  );

  const timeOfDay = timeOfDayGreeting(now);

  const reason = useMemo(
    () => reasons.find((r) => r.type === 'reason' && (r.behaviorId === focus?.id || r.behaviorId === null)),
    [reasons, focus]
  );

  const todayEvents = useMemo(() => {
    const key = todayKey(now);
    return events.filter((e) => dayKey(e.startedAt) === key);
  }, [events, now]);
  const todayResisted = todayEvents.filter((e) => e.outcome === 'resisted' || e.outcome === 'delayed').length;
  const todayOpen = todayEvents.filter((e) => e.outcome === null);
  const lastEvent = todayEvents[0] ?? events[0];

  const greetingName = settings.displayName.trim();

  if (!focus) {
    return (
      <ScreenContainer>
        <Text variant="headline" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
          {GREETING[timeOfDay]}
          {greetingName ? `, ${greetingName}` : ''}
        </Text>
        <EmptyState icon="compass" title="Henüz bir odak yok" description="Bir davranış ekleyerek başlayabilirsin." actionLabel="Davranış ekle" onAction={() => router.push('/behavior-builder')} />
      </ScreenContainer>
    );
  }

  const duration = cleanDuration(focus, now);
  const ms = milestoneProgress(duration.totalHours);
  const earnings = computeEarnings(focus, now);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['4'] }}>
        <Text variant="headline" numberOfLines={1} style={{ flex: 1 }}>
          {GREETING[timeOfDay]}
          {greetingName ? `, ${greetingName}` : ''}
        </Text>
        <IconButton name="bell" accessibilityLabel="Bildirimler" onPress={() => router.push('/(tabs)/today/notifications')} />
      </View>
      <Text variant="caption" color="tertiary" style={{ marginBottom: tokens.spacing['16'] }}>
        {now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {/* Focus card — live ring + clean time + earnings + actions */}
      <Card hero>
        <Pressable onPress={() => router.push({ pathname: '/(tabs)/journey/[id]', params: { id: focus.id } })} accessibilityRole="button" accessibilityLabel={`${focus.name} detayı`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['16'] }}>
            <ProgressRing progress={ms.progress} size={96} color={colors.cyan}>
              <Text variant="statSmall" tabular>
                {duration.days}
              </Text>
              <Text variant="caption" color="tertiary">
                gün
              </Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text variant="title" numberOfLines={1}>
                {focus.name}
              </Text>
              <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['4'] }} tabular>
                {formatDuration(duration.totalMinutes, 'long')}
              </Text>
              {ms.next ? (
                <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }} tabular>
                  {ms.next.label} için {formatRemaining(ms.remainingMinutes)}
                </Text>
              ) : (
                <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
                  Tüm kilometre taşları geçildi
                </Text>
              )}
            </View>
          </View>
        </Pressable>

        {earnings.unitsAvoided !== null ? (
          <View style={{ flexDirection: 'row', gap: tokens.spacing['20'], marginTop: tokens.spacing['20'], flexWrap: 'wrap' }}>
            <Stat value={`${Math.round(earnings.unitsAvoided)}`} label="içilmedi / yapılmadı" />
            {earnings.moneySaved !== null ? <Stat value={formatMoney(earnings.moneySaved, focus.costCurrency)} label="biriken" /> : null}
            {earnings.minutesRecovered !== null ? <Stat value={formatMinutesHuman(earnings.minutesRecovered)} label="geri kazanılan" /> : null}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['20'] }}>
          <View style={{ flex: 1 }}>
            <Button label="Dürtü geldi" variant="secondary" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: focus.id, source: 'today' } })} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Direndim" variant="ghost" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: focus.id, outcome: 'resisted', source: 'today' } })} />
          </View>
        </View>
      </Card>

      {/* H14 — the other behaviors, one tap away */}
      {behaviors.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: tokens.spacing['12'], marginHorizontal: -tokens.spacing['20'] }} contentContainerStyle={{ paddingHorizontal: tokens.spacing['20'], gap: tokens.spacing['8'] }}>
          {behaviors.map((b) => {
            const d = cleanDuration(b, now);
            const selected = b.id === focus.id;
            return (
              <Pressable key={b.id} onPress={() => setFocusId(b.id)} accessibilityRole="button" accessibilityState={{ selected }}>
                <Surface radius="md" bordered style={{ paddingHorizontal: tokens.spacing['12'], paddingVertical: tokens.spacing['8'], borderColor: selected ? colors.indigo : colors.border, borderWidth: selected ? 1.5 : 1, minWidth: 120 }}>
                  <Text variant="label" numberOfLines={1}>
                    {b.name}
                  </Text>
                  <Text variant="caption" color="secondary" tabular>
                    {formatDuration(d.totalMinutes)}
                  </Text>
                </Surface>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* Today summary — immediate feedback for the data you gave */}
      {todayEvents.length > 0 ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text variant="label">Bugün</Text>
              <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
                {todayEvents.length} dürtü · {todayResisted} direndin{todayOpen.length ? ` · ${todayOpen.length} açık` : ''}
              </Text>
            </View>
            <Text variant="label" color="indigo" onPress={() => router.push('/(tabs)/journal')} accessibilityRole="button">
              Günlük
            </Text>
          </View>
          {todayOpen.length > 0 ? (
            <Pressable onPress={() => router.push({ pathname: '/event-detail', params: { id: todayOpen[0].id } })} style={{ marginTop: tokens.spacing['12'], flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['8'] }}>
              <OutcomeBadge outcome={null} />
              <Text variant="caption" color="secondary" style={{ flex: 1 }}>
                {formatRelativeTime(todayOpen[0].startedAt)} kaydettiğin dürtü nasıl bitti?
              </Text>
              <Icon name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {/* Check-in — a micro task, chips inside */}
      <Pressable onPress={() => router.push('/daily-checkin')} style={{ marginTop: tokens.spacing['16'] }} accessibilityRole="button">
        <Card padded>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
            <View style={{ width: 36, height: 36, borderRadius: tokens.radius.xs, backgroundColor: todaysCheckIn && !todaysCheckIn.skipped ? colors.successSoft : colors.slateBlueSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={todaysCheckIn && !todaysCheckIn.skipped ? 'check' : 'feather'} size={18} color={todaysCheckIn && !todaysCheckIn.skipped ? colors.success : colors.slateBlue} />
            </View>
            <View style={{ flex: 1 }}>
              {todaysCheckIn && !todaysCheckIn.skipped ? (
                <>
                  <Text variant="label">Bugünkü check-in tamamlandı</Text>
                  <Text variant="caption" color="secondary" numberOfLines={1}>
                    {todaysCheckIn.answer || todaysCheckIn.question}
                  </Text>
                </>
              ) : (
                <>
                  <Text variant="label">{questionForDate(now)}</Text>
                  <Text variant="caption" color="tertiary">
                    Bir dokunuşla cevapla.
                  </Text>
                </>
              )}
            </View>
            <Icon name="chevron-right" size={18} color={colors.textTertiary} />
          </View>
        </Card>
      </Pressable>

      {/* Günün sözü (Part 3 quote engine) + own reason (F2) */}
      <Card padded style={{ marginTop: tokens.spacing['16'] }}>
        {quote ? (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing['8'] }}>
              <Text variant="caption" color="tertiary">
                Günün sözü · {QUOTE_CATEGORY_LABEL[quote.category]}
              </Text>
              <Pressable onPress={() => toggleFavoriteQuote(quote.id)} hitSlop={12} accessibilityRole="button" accessibilityLabel={quoteIsFavorite ? 'Favoriden çıkar' : 'Favorilere ekle'}>
                <Icon name={quoteIsFavorite ? 'bookmark' : 'heart'} size={18} color={quoteIsFavorite ? colors.indigo : colors.textTertiary} />
              </Pressable>
            </View>
            <Pressable onPress={() => router.push({ pathname: '/quote/[id]', params: { id: quote.id } })} accessibilityRole="button" accessibilityLabel="Günün sözünü aç">
              <Text variant="bodyLarge" serif>
                {quote.text}
              </Text>
              {quote.author ? (
                <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
                  — {quote.author}
                </Text>
              ) : null}
            </Pressable>
          </View>
        ) : null}
        {reason ? (
          <View style={{ marginTop: tokens.spacing['16'], paddingTop: tokens.spacing['16'], borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text variant="caption" color="tertiary">
              Senin nedenin
            </Text>
            <Text variant="body" serif style={{ marginTop: tokens.spacing['4'] }}>
              {reason.text}
            </Text>
          </View>
        ) : (
          <Text variant="caption" color="indigo" style={{ marginTop: tokens.spacing['12'] }} onPress={() => router.push('/(tabs)/you/notes')} accessibilityRole="button">
            Kendi nedenini ekle
          </Text>
        )}
      </Card>

      {lastEvent && todayEvents.length === 0 ? (
        <Pressable onPress={() => router.push('/(tabs)/journal')} style={{ marginTop: tokens.spacing['16'] }}>
          <Text variant="caption" color="tertiary">
            Son kayıt · {formatRelativeTime(lastEvent.startedAt)}
          </Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text variant="statSmall" tabular>
        {value}
      </Text>
      <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
        {label}
      </Text>
    </View>
  );
}
