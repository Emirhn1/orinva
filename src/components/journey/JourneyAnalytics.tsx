import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card, Text, ProgressRing, Chip, TrendBars, HeatGrid, DistributionBars, CalendarGrid, EvidenceCaption, EmptyState } from '@/components/ui';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { UrgeEvent, Behavior } from '@/data/types';
import { TRIGGER_CHIPS, LOCATION_CHIPS } from '@/content/chips';
import { todayKey, dayKey, formatMoney, formatMinutesHuman } from '@/utils/date';
import {
  RangeDays,
  eventsInWindow,
  eventsInPreviousWindow,
  computeResistRate,
  computeTrendSeries,
  computeHeatmap,
  describeHeatCell,
  computeTriggerDistribution,
  computeSingleFieldDistribution,
  computeInsights,
  computeCalendarStates,
  comparePeriods,
  computeIntensityTrend,
  computeEarnings,
  computeMoodOutcome,
  HeatCell,
} from '@/utils/journey';

const RANGES: { id: RangeDays; label: string }[] = [
  { id: 7, label: '7 gün' },
  { id: 30, label: '30 gün' },
  { id: 90, label: '90 gün' },
  { id: 0, label: 'Tümü' },
];

const MIN_SAMPLE = 5;

interface Props {
  events: UrgeEvent[]; // already filtered to the behavior(s) of interest
  behaviors: Behavior[]; // behaviors these events belong to (1 = detail screen, n = overview)
  now: Date;
  onLogPress?: () => void;
  /** Overview shows the range selector; detail can hide it. */
  showRange?: boolean;
}

const triggerLabel = (id: string) => resolveChipLabel(TRIGGER_CHIPS, id) ?? id;
const locationLabel = (id: string) => resolveChipLabel(LOCATION_CHIPS, id) ?? id;

/**
 * The shared analytics stack used by Journey overview and Behavior detail
 * (Plan §6.2). Every chart carries its denominator; sections that don't yet
 * have enough data say so instead of rendering an empty graph.
 */
export function JourneyAnalytics({ events, behaviors, now, onLogPress, showRange = true }: Props) {
  const { colors, tokens } = useTheme();
  const [range, setRange] = useState<RangeDays>(7);
  const [selectedCell, setSelectedCell] = useState<HeatCell | null>(null);

  const windowEvents = useMemo(() => eventsInWindow(events, range, now), [events, range, now]);
  const previousEvents = useMemo(() => eventsInPreviousWindow(events, range, now), [events, range, now]);
  const rate = useMemo(() => computeResistRate(windowEvents), [windowEvents]);
  const series = useMemo(() => computeTrendSeries(windowEvents, range, now), [windowEvents, range, now]);
  const heat = useMemo(() => computeHeatmap(windowEvents), [windowEvents]);
  const triggers = useMemo(() => computeTriggerDistribution(windowEvents, 5), [windowEvents]);
  const locations = useMemo(() => computeSingleFieldDistribution(windowEvents, 'location', 3), [windowEvents]);
  const mood = useMemo(() => computeMoodOutcome(windowEvents), [windowEvents]);
  const intensity = useMemo(() => computeIntensityTrend(windowEvents), [windowEvents]);
  const insights = useMemo(() => computeInsights(windowEvents, { trigger: triggerLabel, location: locationLabel }), [windowEvents]);
  const comparison = useMemo(() => comparePeriods(windowEvents, previousEvents), [windowEvents, previousEvents]);
  const calendarStates = useMemo(() => computeCalendarStates(events), [events]);
  const allDataDays = useMemo(() => new Set(events.map((event) => dayKey(event.startedAt))).size, [events]);
  const windowDataDays = useMemo(() => new Set(windowEvents.map((event) => dayKey(event.startedAt))).size, [windowEvents]);
  const hasTrendData = windowDataDays >= 7;
  const hasInsightData = windowEvents.length >= 15 && windowDataDays >= 3;

  const rangeLabel = RANGES.find((r) => r.id === range)?.label ?? '';

  return (
    <View style={{ gap: tokens.spacing['16'] }}>
      {showRange ? (
        <View style={{ flexDirection: 'row', gap: tokens.spacing['8'] }}>
          {RANGES.map((r) => {
            const disabled = (r.id === 30 || r.id === 90) && allDataDays < 3;
            return <Chip key={r.id} label={r.label} selected={range === r.id} onPress={() => setRange(r.id)} compact disabled={disabled} />;
          })}
        </View>
      ) : null}

      {/* Resist rate hero */}
      <Card hero>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['20'] }}>
          <ProgressRing progress={rate.rate ?? 0} size={96} color={colors.outcomeResisted}>
            <Text variant="statSmall" tabular>
              {rate.rate !== null ? `%${Math.round(rate.rate * 100)}` : '—'}
            </Text>
            <Text variant="caption" color="tertiary">
              direnme
            </Text>
          </ProgressRing>
          <View style={{ flex: 1 }}>
            <Text variant="title">{rangeLabel}</Text>
            <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
              {windowEvents.length === 0
                ? 'Henüz kayıt yok. Alan hazır.'
                : rate.closed > 0
                  ? `${rate.closed} sonuçlanmış kaydın ${rate.resisted}'inde direndin ya da erteledin (${Math.round((rate.rate ?? 0) * 100)}%).${windowEvents.length - rate.closed > 0 ? ` ${windowEvents.length - rate.closed} kayıt bu orana girmiyor.` : ''}`
                  : `${windowEvents.length} istek kaydettin; sonuçları Günlük'ten tamamlayabilirsin.`}
            </Text>
            {comparison.deltaPct !== null ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'], marginTop: tokens.spacing['8'] }}>
                <Icon name={comparison.direction === 'down' ? 'trending-up' : 'activity'} size={14} color={comparison.direction === 'down' ? colors.success : colors.textTertiary} />
                <Text variant="caption" color={comparison.direction === 'down' ? 'success' : 'tertiary'}>
                  Önceki döneme göre {comparison.deltaPct > 0 ? '+' : ''}
                  {comparison.deltaPct}% istek
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        {rate.closed > 0 ? <EvidenceCaption sample={rate.closed} unit="sonuçlanmış kayıttan" /> : null}
      </Card>

      {windowEvents.length === 0 ? (
        <Card padded>
          <EmptyState icon="trending-up" title="İlk kaydın buraya gelecek" description="İstek kaydettikçe örüntün burada şekillenir." actionLabel={onLogPress ? 'İstek kaydet' : undefined} onAction={onLogPress} />
        </Card>
      ) : null}

      {/* Trend */}
      {windowEvents.length > 0 && hasTrendData ? (
        <Card padded title="Değişim" caption={range === 7 || range === 30 ? 'günlük' : 'haftalık'}>
          <TrendBars points={series} />
          <EvidenceCaption sample={windowEvents.length} />
        </Card>
      ) : windowEvents.length > 0 ? (
        <Card padded title="Değişim">
          <Text variant="body" color="secondary">Değişimi göstermek için en az 7 farklı günde kayıt gerekiyor.</Text>
          <EvidenceCaption sample={windowDataDays} unit="kayıtlı günden" />
        </Card>
      ) : null}

      {/* Insights */}
      {hasInsightData && insights.length > 0 ? (
        <Card padded accent="violet" title="Senin örüntün">
          <View style={{ gap: tokens.spacing['12'] }}>
            {insights.map((i) => (
              <View key={i.id} style={{ flexDirection: 'row', gap: tokens.spacing['12'], alignItems: 'flex-start' }}>
                <Icon name={i.tone === 'success' ? 'check' : 'info'} size={18} color={i.tone === 'success' ? colors.success : colors.violet} />
                <Text variant="body" style={{ flex: 1 }}>
                  {i.text}
                </Text>
              </View>
            ))}
          </View>
          <EvidenceCaption sample={windowEvents.length} />
        </Card>
      ) : windowEvents.length > 0 && !hasInsightData ? (
        <Card padded title="Örüntün">
          <Text variant="body" color="secondary">Örüntünü görmek için biraz daha veri gerekiyor. En az 3 farklı gün ve 15 kayıt olduğunda burada görünecek.</Text>
          <EvidenceCaption sample={windowEvents.length} />
        </Card>
      ) : null}

      {/* Heatmap */}
      {windowEvents.length >= MIN_SAMPLE ? (
        <Card padded title="Hangi gün, hangi saat?">
          <HeatGrid cells={heat.cells} max={heat.max} onSelect={setSelectedCell} selected={selectedCell} />
          <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['12'] }}>
            {selectedCell
              ? `${describeHeatCell(selectedCell)}: ${selectedCell.count} kayıt${selectedCell.acted ? `, ${selectedCell.acted} yaptım` : ''}`
              : heat.peak
                ? `En yoğun: ${describeHeatCell(heat.peak)}.`
                : ''}
          </Text>
          <EvidenceCaption sample={windowEvents.length} />
        </Card>
      ) : null}

      {/* Triggers */}
      {triggers.rows.length > 0 && triggers.sample >= 3 ? (
        <Card padded title="Tetikleyiciler">
          <DistributionBars rows={triggers.rows} labelFor={triggerLabel} />
          <EvidenceCaption sample={triggers.sample} unit="tetikleyicili kayıttan" />
        </Card>
      ) : null}

      {/* Mood ↔ outcome + intensity */}
      {(mood.tenseSample >= 3 && mood.calmSample >= 3) || intensity.sample >= 6 ? (
        <Card padded title="Nasıl hissederken?">
          {mood.tenseSample >= 3 && mood.calmSample >= 3 && mood.tenseRate !== null && mood.calmRate !== null ? (
            <View style={{ flexDirection: 'row', gap: tokens.spacing['24'] }}>
              <Stat value={`%${Math.round(mood.tenseRate * 100)}`} label={`gerginken direnme · ${mood.tenseSample}`} />
              <Stat value={`%${Math.round(mood.calmRate * 100)}`} label={`sakinken direnme · ${mood.calmSample}`} />
            </View>
          ) : null}
          {intensity.sample >= 6 && intensity.earlyAvg !== null && intensity.lateAvg !== null ? (
            <View style={{ flexDirection: 'row', gap: tokens.spacing['24'], marginTop: tokens.spacing['16'] }}>
              <Stat value={intensity.earlyAvg.toFixed(1)} label="ilk yarı ort. şiddet" />
              <Stat value={intensity.lateAvg.toFixed(1)} label="son yarı ort. şiddet" />
            </View>
          ) : null}
          <EvidenceCaption sample={Math.max(intensity.sample, mood.tenseSample + mood.calmSample)} />
        </Card>
      ) : null}

      {/* Locations */}
      {locations.rows.length > 0 && locations.sample >= 3 ? (
        <Card padded title="Nerede?">
          <DistributionBars rows={locations.rows} labelFor={locationLabel} color={colors.slateBlue} />
          <EvidenceCaption sample={locations.sample} unit="konumlu kayıttan" />
        </Card>
      ) : null}

      {/* Earnings */}
      {behaviors.some((b) => b.baselinePerDay) ? (
        <Card padded title="Kazanç">
          <View style={{ gap: tokens.spacing['16'] }}>
            {behaviors
              .filter((b) => b.baselinePerDay)
              .map((b) => {
                const e = computeEarnings(b, now, events);
                return (
                  <View key={b.id}>
                    {behaviors.length > 1 ? (
                      <Text variant="label" style={{ marginBottom: tokens.spacing['8'] }}>
                        {b.name}
                      </Text>
                    ) : null}
                    <View style={{ flexDirection: 'row', gap: tokens.spacing['20'], flexWrap: 'wrap' }}>
                      <Stat value={`${Math.round(e.unitsAvoided ?? 0)}`} label="yapılmadı" />
                      {e.moneySaved !== null ? <Stat value={formatMoney(e.moneySaved, b.costCurrency)} label="biriken" /> : null}
                      {e.minutesRecovered !== null ? <Stat value={formatMinutesHuman(e.minutesRecovered)} label="geri kazanılan" /> : null}
                    </View>
                    {e.goalProgress !== null && b.savingsGoalLabel ? (
                      <View style={{ marginTop: tokens.spacing['12'] }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.spacing['4'] }}>
                          <Text variant="caption" color="secondary">
                            Hedef: {b.savingsGoalLabel}
                          </Text>
                          <Text variant="caption" color="secondary" tabular>
                            %{Math.round(e.goalProgress * 100)}
                          </Text>
                        </View>
                        <View style={{ height: 6, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceSecondary, overflow: 'hidden' }}>
                          <View style={{ width: `${e.goalProgress * 100}%`, height: '100%', backgroundColor: colors.bronze, borderRadius: tokens.radius.pill }} />
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
          </View>
          <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['12'] }}>
            Önceki günlük ortalama ile gerçek kayıtların farkından tahmin.
          </Text>
        </Card>
      ) : null}

      {/* Calendar */}
      <Card padded title="Bu ay" caption={now.toLocaleDateString('tr-TR', { month: 'long' })}>
        <CalendarGrid year={now.getFullYear()} month={now.getMonth()} states={calendarStates} todayKey={todayKey(now)} />
      </Card>
    </View>
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
