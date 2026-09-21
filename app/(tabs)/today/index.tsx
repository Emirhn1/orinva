import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer, Text, Card, Button, IconButton, EmptyState, Surface, OutcomeBadge } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore, checkMilestonesForBehavior } from '@/store/useAppStore';
import { cleanDuration, computeEarnings, computeActedStats, actedSeries } from '@/utils/journey';
import { formatRelativeTime, timeOfDayGreeting, todayKey, formatDuration, formatMoney, formatMinutesHuman, dayKey } from '@/utils/date';
import { useNow } from '@/utils/useNow';
import { questionForDate } from '@/content/library';
import { Quote } from '@/content/quotes';
import { Behavior } from '@/data/types';
import { behaviorTypeLabel } from '@/content/behaviors';
import { commitActed } from '@/utils/actedFlow';
import { LinearGradient } from 'expo-linear-gradient';
import { FirstDayCounter } from '@/components/journey/FirstDayCounter';
import { QuoteCarousel } from '@/components/quotes/QuoteCarousel';

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
  const earnings = computeEarnings(focus, now, events);
  const acted = computeActedStats(events, focus, now);
  const overTarget = !!focus.dailyTarget && acted.today > focus.dailyTarget;
  const week = actedSeries(events, focus.id, 7, now);
  const weekMax = Math.max(1, ...week.map((item) => item.count));
  const focusColor = colors[focus.color];
  const todayActedEvents = todayEvents.filter((event) => event.behaviorId === focus.id && event.outcome === 'acted');

  const logActed = () => commitActed(router, focus, { source: 'today' });

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

      {quote ? <QuoteCarousel featured={quote} meta={quoteMeta} onFavorite={toggleFavoriteQuote} /> : null}

      {focus.needsNameReview ? (
        <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], marginBottom: tokens.spacing['12'], borderColor: colors.indigo }}>
          <Text variant="label">Bu adı eski kaydından oluşturdum</Text>
          <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
            İstersen sana daha anlamlı gelen bir takma adla değiştirebilirsin.
          </Text>
          <Text
            variant="label"
            color="indigo"
            style={{ marginTop: tokens.spacing['8'] }}
            onPress={() => router.push({ pathname: '/behavior-builder', params: { id: focus.id } })}
            accessibilityRole="button"
          >
            Adı düzenle
          </Text>
        </Surface>
      ) : null}

      {/* Focus card — live ring + clean time + earnings + actions */}
      <Card hero>
        <Pressable onPress={() => router.push({ pathname: '/(tabs)/journey/[id]', params: { id: focus.id } })} accessibilityRole="button" accessibilityLabel={`${focus.name} detayı`}>
          <View>
            <Text variant="title" numberOfLines={2}>{focus.name}</Text>
            <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'], marginBottom: tokens.spacing['16'] }}>{behaviorTypeLabel(focus.category)}</Text>
            <FirstDayCounter totalMinutes={duration.totalMinutes} color={focusColor} />
          </View>
        </Pressable>

        {earnings.unitsAvoided !== null ? (
          <View style={{ flexDirection: 'row', gap: tokens.spacing['20'], marginTop: tokens.spacing['20'], flexWrap: 'wrap' }}>
            <Stat value={`${Math.round(earnings.unitsAvoided)}`} label="içilmedi / yapılmadı" />
            {earnings.moneySaved !== null ? <Stat value={formatMoney(earnings.moneySaved, focus.costCurrency)} label="biriken" /> : null}
            {earnings.minutesRecovered !== null ? <Stat value={formatMinutesHuman(earnings.minutesRecovered)} label="geri kazanılan" /> : null}
          </View>
        ) : null}

        <View style={{ marginTop: tokens.spacing['16'], paddingTop: tokens.spacing['16'], borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text variant="caption" color="tertiary">Bugün {focus.verbDid.toLocaleLowerCase('tr-TR')} kaydı</Text>
          <Text variant="statLarge" tabular style={{ marginTop: tokens.spacing['4'], color: overTarget ? colors.amber : colors.textPrimary }}>
            {acted.today}{focus.dailyTarget ? <Text variant="body" color="tertiary">{` / ${focus.dailyTarget} hedef`}</Text> : null}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: tokens.spacing['8'], height: 52, marginTop: tokens.spacing['12'] }}>
            {week.map((item, index) => (
              <View key={item.key} style={{ flex: 1, alignItems: 'center', gap: tokens.spacing['4'] }}>
                <View style={{ width: '100%', height: Math.max(3, (item.count / weekMax) * 34), borderRadius: tokens.radius.xs, backgroundColor: index === week.length - 1 ? focusColor : colors.surfaceSecondary }} />
                <Text variant="caption" color="tertiary" style={{ fontSize: 10 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary action stays above the floating emergency button. */}
        <View style={{ marginTop: tokens.spacing['20'] }}>
          <Button label={`＋ ${focus.verbDid}`} onPress={logActed} haptic="none" />
        </View>

        <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['12'] }}>
          <View style={{ flex: 1 }}>
            <Button label={focus.verbUrge} variant="secondary" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: focus.id, source: 'today' } })} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label={focus.verbResist} variant="ghost" onPress={() => router.push({ pathname: '/quick-log', params: { behaviorId: focus.id, outcome: 'resisted', source: 'today' } })} />
          </View>
        </View>

      </Card>

      {/* H14 — the other behaviors, one tap away */}
      {behaviors.length > 1 ? (
        <View style={{ marginTop: tokens.spacing['12'], marginHorizontal: -tokens.spacing['20'] }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: tokens.spacing['20'], paddingRight: tokens.spacing['48'], gap: tokens.spacing['8'] }}>
          {behaviors.map((b) => {
            const d = cleanDuration(b, now);
            const selected = b.id === focus.id;
            return (
              <Pressable key={b.id} onPress={() => setFocusId(b.id)} accessibilityRole="button" accessibilityState={{ selected }}>
                <Surface radius="md" bordered style={{ paddingHorizontal: tokens.spacing['12'], paddingVertical: tokens.spacing['8'], borderColor: selected ? colors[b.color] : colors.border, borderLeftWidth: 4, borderLeftColor: colors[b.color], backgroundColor: selected ? colors[b.color] : colors.surface, minWidth: 144 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['8'] }}>
                    <Icon name={b.icon as any} size={16} color={selected ? colors.onAccent : colors[b.color]} />
                    <Text variant="label" numberOfLines={2} style={{ flex: 1, color: selected ? colors.onAccent : colors.textPrimary }}>
                    {b.name}
                    </Text>
                  </View>
                  <Text variant="caption" numberOfLines={1} style={{ color: selected ? colors.onAccent : colors.textTertiary, opacity: selected ? 0.85 : 1 }}>
                    {behaviorTypeLabel(b.category)}
                  </Text>
                  <Text variant="caption" tabular style={{ color: selected ? colors.onAccent : colors.textSecondary, opacity: selected ? 0.85 : 1 }}>
                    {formatDuration(d.totalMinutes)}
                  </Text>
                </Surface>
              </Pressable>
            );
          })}
        </ScrollView>
        <LinearGradient pointerEvents="none" colors={['transparent', colors.background]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: 0, bottom: behaviors.length > 3 ? 13 : 0, width: 36 }} />
        {behaviors.length > 3 ? <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: tokens.spacing['8'] }}>{behaviors.map((b) => <View key={b.id} style={{ width: focus.id === b.id ? 12 : 5, height: 5, borderRadius: 3, backgroundColor: focus.id === b.id ? colors.indigo : colors.borderStrong }} />)}</View> : null}
        </View>
      ) : null}

      {/* Today summary — immediate feedback for the data you gave */}
      {todayEvents.length > 0 ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text variant="label">Bugün</Text>
              <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
                Bugün gelen istek: {todayEvents.length} · direndiğin/ertelediğin: {todayResisted}{todayOpen.length ? ` · sonuçsuz: ${todayOpen.length}` : ''}
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
                {formatRelativeTime(todayOpen[0].startedAt)} kaydettiğin istek nasıl bitti?
              </Text>
              <Icon name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      <Card padded style={{ marginTop: tokens.spacing['16'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text variant="label">Bugünkü {focus.name} kayıtları</Text>
            <Text variant="caption" color="tertiary">{todayActedEvents.length ? `${todayActedEvents.length} kayıt · son kayıt ${new Date(todayActedEvents[0].startedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` : 'Bugün henüz kayıt yok.'}</Text>
          </View>
          <Pressable onPress={logActed} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${focus.verbDid} kaydı ekle`} style={{ minWidth: 104, minHeight: 44, paddingHorizontal: tokens.spacing['16'], borderRadius: tokens.radius.pill, backgroundColor: focusColor, flexDirection: 'row', gap: tokens.spacing['8'], alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={18} color={colors.onAccent} />
            <Text variant="label" color="onAccent">{focus.verbDid}</Text>
          </Pressable>
        </View>
        {todayActedEvents.length ? (
          <View style={{ marginTop: tokens.spacing['12'], gap: tokens.spacing['8'] }}>
            {todayActedEvents.slice(0, 3).map((event) => (
              <View key={event.id} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text variant="body" style={{ flex: 1 }}>{focus.verbDid} · {new Date(event.startedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                <Icon name="check" size={17} color={colors.success} />
              </View>
            ))}
            <Pressable onPress={() => router.push({ pathname: '/(tabs)/today/records', params: { behaviorId: focus.id } })} accessibilityRole="button" style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="label" color="indigo">Tüm kayıtları gör</Text>
              <Icon name="chevron-right" size={17} color={colors.indigo} />
            </Pressable>
          </View>
        ) : <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['12'] }}>Bugün bu davranış için yapılmış kayıt yok.</Text>}
      </Card>

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
                  <Text variant="label">Bugünkü yoklama tamamlandı</Text>
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

      <Card padded style={{ marginTop: tokens.spacing['16'] }}>
        {reason ? (
          <View>
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
