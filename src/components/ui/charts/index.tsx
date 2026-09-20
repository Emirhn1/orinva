import React from 'react';
import { View, Pressable } from 'react-native';
import Svg, { Rect, Line, Circle, Text as SvgText } from 'react-native-svg';
import { Text } from '../Typography';
import { useTheme } from '@/design/ThemeProvider';
import { SeriesPoint, HeatCell, HEAT_BLOCKS, HEAT_DAYS, DistributionRow, CalendarState } from '@/utils/journey';

/** Every chart ships with a denominator (DESIGN.md §22). */
export function EvidenceCaption({ sample, unit = 'kayıttan' }: { sample: number; unit?: string }) {
  const { tokens } = useTheme();
  return (
    <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['8'] }} accessibilityRole="text">
      {sample} {unit}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Trend bars — total urges per bucket, resisted share stacked on top
// ---------------------------------------------------------------------------

export function TrendBars({ points, height = 120 }: { points: SeriesPoint[]; height?: number }) {
  const { colors, tokens } = useTheme();
  const [width, setWidth] = React.useState(0);
  const max = Math.max(1, ...points.map((p) => p.total));
  const gap = points.length > 14 ? 2 : 6;
  const axisW = 28;
  const plotW = Math.max(0, width - axisW - 4);
  const barW = width > 0 ? Math.max(2, (plotW - gap * (points.length - 1)) / points.length) : 0;
  const chartTop = 16;
  const chartBottom = height - 20;
  const plotH = chartBottom - chartTop;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Line x1={axisW} y1={chartTop} x2={axisW} y2={chartBottom} stroke={colors.borderStrong} strokeWidth={1} />
          <Line x1={axisW} y1={chartBottom} x2={width} y2={chartBottom} stroke={colors.borderStrong} strokeWidth={1} />
          <Line x1={axisW} y1={chartTop + plotH / 2} x2={width} y2={chartTop + plotH / 2} stroke={colors.surfaceSecondary} strokeWidth={1} />
          <SvgText x={axisW - 4} y={chartTop + 4} fill={colors.textTertiary} fontSize={9} textAnchor="end">{max}</SvgText>
          <SvgText x={axisW - 4} y={chartTop + plotH / 2 + 3} fill={colors.textTertiary} fontSize={9} textAnchor="end">{Math.ceil(max / 2)}</SvgText>
          <SvgText x={axisW - 4} y={chartBottom + 3} fill={colors.textTertiary} fontSize={9} textAnchor="end">0</SvgText>
          {points.map((p, i) => {
            const x = axisW + i * (barW + gap);
            const totalH = (p.total / max) * plotH * 0.9;
            const resistedH = (p.resisted / max) * plotH * 0.9;
            const r = Math.min(tokens.radius.sm, barW / 2);
            return (
              <React.Fragment key={p.key}>
                {p.total > 0 ? (
                  <Rect x={x} y={chartBottom - totalH} width={barW} height={totalH} rx={r} fill={colors.indigo} opacity={0.35} />
                ) : (
                  <Rect x={x} y={chartBottom - 2} width={barW} height={2} rx={1} fill={colors.surfaceSecondary} />
                )}
                {p.resisted > 0 ? <Rect x={x} y={chartBottom - resistedH} width={barW} height={resistedH} rx={r} fill={colors.outcomeResisted} /> : null}
                {p.total > 0 ? <SvgText x={x + barW / 2} y={Math.max(chartTop + 8, chartBottom - totalH - 3)} fill={colors.textSecondary} fontSize={barW < 10 ? 7 : 9} textAnchor="middle">{p.total}</SvgText> : null}
              </React.Fragment>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
      {points.length <= 10 ? (
        <View style={{ flexDirection: 'row', marginTop: tokens.spacing['4'], marginLeft: axisW }}>
          {points.map((p, i) => (
            <Text key={p.key + i} variant="caption" color="tertiary" style={{ width: barW + gap, textAlign: 'center', fontSize: 10 }} numberOfLines={1}>
              {p.label}
            </Text>
          ))}
        </View>
      ) : (
        // Dense series: three anchors (start · middle · end) instead of one label per bar.
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: tokens.spacing['4'], marginLeft: axisW }}>
          {[points[0], points[Math.floor(points.length / 2)], points[points.length - 1]].map((p, i) => (
            <Text key={p.key + i} variant="caption" color="tertiary" style={{ fontSize: 10 }}>
              {shortDate(p.key)}
            </Text>
          ))}
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: tokens.spacing['16'], marginTop: tokens.spacing['8'] }}>
        <LegendDot color={colors.outcomeResisted} label="Direndim / erteledim" />
        <LegendDot color={colors.indigo} label="Toplam istek" faint />
      </View>
    </View>
  );
}

function shortDate(key: string): string {
  const [, m, d] = key.split('-');
  return `${Number(d)}/${Number(m)}`;
}

function LegendDot({ color, label, faint }: { color: string; label: string; faint?: boolean }) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, opacity: faint ? 0.35 : 1 }} />
      <Text variant="caption" color="tertiary">
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Time-of-week heat grid — 7 days × 6 blocks, dot size encodes 3 states
// ---------------------------------------------------------------------------

export function HeatGrid({ cells, max, onSelect, selected }: { cells: HeatCell[]; max: number; onSelect?: (c: HeatCell) => void; selected?: HeatCell | null }) {
  const { colors, tokens } = useTheme();
  const labelW = 28;
  const [width, setWidth] = React.useState(0);
  const cellSize = width > 0 ? Math.floor((width - labelW - 5 * 4) / 6) : 0;

  const state = (c: HeatCell): 0 | 1 | 2 => {
    if (c.count === 0 || max === 0) return 0;
    return c.count >= Math.max(2, max * 0.6) ? 2 : 1;
  };

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={{ flexDirection: 'row', marginLeft: labelW, gap: 4, marginBottom: 4 }}>
        {HEAT_BLOCKS.map((b) => (
          <Text key={b.id} variant="caption" color="tertiary" style={{ width: cellSize, textAlign: 'center', fontSize: 10 }} numberOfLines={1}>
            {b.label}
          </Text>
        ))}
      </View>
      {HEAT_DAYS.map((day, d) => (
        <View key={day} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Text variant="caption" color="tertiary" style={{ width: labelW - 4, fontSize: 10 }}>
            {day}
          </Text>
          {HEAT_BLOCKS.map((b) => {
            const c = cells[d * 6 + b.id];
            const s = state(c);
            const isSel = selected && selected.day === c.day && selected.block === c.block;
            const dot = s === 0 ? 0 : s === 1 ? Math.round(cellSize * 0.3) : Math.round(cellSize * 0.55);
            return (
              <Pressable
                key={b.id}
                onPress={onSelect ? () => onSelect(c) : undefined}
                accessibilityRole="button"
                accessibilityLabel={`${day} ${b.label}: ${c.count} kayıt`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: tokens.radius.xs,
                  backgroundColor: colors.surfaceSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isSel ? 1.5 : 0,
                  borderColor: colors.indigo,
                }}
              >
                {dot > 0 ? (
                  <View
                    style={{
                      width: dot,
                      height: dot,
                      borderRadius: dot / 2,
                      backgroundColor: c.acted > 0 && c.acted >= c.count / 2 ? colors.outcomeActed : colors.indigo,
                      opacity: s === 1 ? 0.7 : 1,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Horizontal distribution bars (triggers, locations…)
// ---------------------------------------------------------------------------

export function DistributionBars({ rows, labelFor, color }: { rows: DistributionRow[]; labelFor: (id: string) => string; color?: string }) {
  const { colors, tokens } = useTheme();
  const max = Math.max(1, ...rows.map((r) => r.share));
  return (
    <View style={{ gap: tokens.spacing['8'] }}>
      {rows.map((r) => (
        <View key={r.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>
              {labelFor(r.id)}
            </Text>
            <Text variant="caption" color="secondary" tabular>
              %{Math.round(r.share * 100)}
              {r.resistRate !== null ? ` · direnme %${Math.round(r.resistRate * 100)}` : ''}
            </Text>
          </View>
          <View style={{ height: 6, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceSecondary, overflow: 'hidden' }}>
            <View style={{ width: `${(r.share / max) * 100}%`, height: '100%', backgroundColor: color ?? colors.indigo, borderRadius: tokens.radius.pill }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Month calendar — DESIGN.md §23: max 3 states, shape + label, not colour alone
// ---------------------------------------------------------------------------

export function CalendarGrid({ year, month, states, todayKey }: { year: number; month: number; states: Record<string, CalendarState>; todayKey: string }) {
  const { colors, tokens } = useTheme();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const [width, setWidth] = React.useState(0);
  const cellSize = width > 0 ? Math.floor((width - 6 * 4) / 7) : 0;

  const key = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
        {HEAT_DAYS.map((d) => (
          <Text key={d} variant="caption" color="tertiary" style={{ width: cellSize, textAlign: 'center', fontSize: 10 }}>
            {d}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
          {cells.slice(row * 7, row * 7 + 7).map((d, i) => {
            if (d === null) return <View key={i} style={{ width: cellSize, height: cellSize }} />;
            const k = key(d);
            const s = states[k] ?? 'none';
            const isToday = k === todayKey;
            return (
              <View
                key={i}
                accessibilityLabel={`${d}: ${s === 'aligned' ? 'planla temas' : s === 'hard' ? 'zor gün' : 'kayıt yok'}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: tokens.radius.xs,
                  backgroundColor: s === 'aligned' ? colors.outcomeResistedSoft : s === 'hard' ? colors.outcomeActedSoft : colors.surfaceSecondary,
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: colors.indigo,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="caption" color={s === 'none' ? 'tertiary' : 'primary'} style={{ fontSize: 10, lineHeight: 12 }}>
                  {d}
                </Text>
                {s !== 'none' ? (
                  <Svg width={8} height={8} style={{ marginTop: 1 }}>
                    {s === 'aligned' ? (
                      <Circle cx={4} cy={4} r={3} fill={colors.outcomeResisted} />
                    ) : (
                      <Circle cx={4} cy={4} r={2.5} stroke={colors.outcomeActed} strokeWidth={1.5} fill="none" />
                    )}
                  </Svg>
                ) : (
                  <View style={{ height: 9 }} />
                )}
              </View>
            );
          })}
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: tokens.spacing['16'], marginTop: tokens.spacing['8'] }}>
        <LegendDot color={colors.outcomeResisted} label="Planla temas" />
        <LegendDot color={colors.outcomeActed} label="Zor gün" />
        <LegendDot color={colors.borderStrong} label="Kayıt yok" />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Before/after intensity — two small bars ("4'ten 2'ye düştü")
// ---------------------------------------------------------------------------

export function IntensityDrop({ before, after }: { before: number; after: number }) {
  const { colors, tokens } = useTheme();
  const scale = (v: number) => `${(v / 5) * 100}%`;
  return (
    <View style={{ gap: tokens.spacing['8'] }}>
      <Row label="Başta" value={before} width={scale(before)} color={colors.amber} />
      <Row label="Şimdi" value={after} width={scale(after)} color={after < before ? colors.outcomeResisted : colors.slateBlue} />
    </View>
  );

  function Row({ label, value, width, color }: { label: string; value: number; width: string; color: string }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
        <Text variant="caption" color="tertiary" style={{ width: 40 }}>
          {label}
        </Text>
        <View style={{ flex: 1, height: 10, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceSecondary, overflow: 'hidden' }}>
          <View style={{ width: width as any, height: '100%', backgroundColor: color, borderRadius: tokens.radius.pill }} />
        </View>
        <Text variant="label" tabular style={{ width: 20, textAlign: 'right' }}>
          {value}
        </Text>
      </View>
    );
  }
}
