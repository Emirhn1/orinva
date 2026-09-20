import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, EmptyState, OutcomeBadge, Chip } from '@/components/ui';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { formatClock, dayKey, formatDayHeading } from '@/utils/date';
import { TRIGGER_CHIPS, JOURNAL_TAG_CHIPS, MOOD_CHIPS } from '@/content/chips';
import { UrgeEvent, JournalEntry } from '@/data/types';

type Filter = 'all' | 'events' | 'notes' | 'open';

type Item = { kind: 'event'; at: string; event: UrgeEvent } | { kind: 'note'; at: string; entry: JournalEntry };

/** Günlük — istek kayıtları ve notlar, güne göre tek akışta. */
export default function JournalScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const events = useAppStore((s) => s.events);
  const entries = useAppStore((s) => s.journalEntries);
  const behaviors = useAppStore((s) => s.behaviors);
  const [filter, setFilter] = useState<Filter>('all');

  const openCount = useMemo(() => events.filter((e) => e.outcome === null).length, [events]);

  const groups = useMemo(() => {
    const items: Item[] = [];
    if (filter !== 'notes') {
      for (const e of events) {
        if (filter === 'open' && e.outcome !== null) continue;
        items.push({ kind: 'event', at: e.startedAt, event: e });
      }
    }
    if (filter === 'all' || filter === 'notes') {
      for (const n of entries) items.push({ kind: 'note', at: n.createdAt, entry: n });
    }
    items.sort((a, b) => (a.at < b.at ? 1 : -1));
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const k = dayKey(it.at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    return Array.from(map.entries());
  }, [events, entries, filter]);

  const behaviorName = (id: string) => behaviors.find((b) => b.id === id)?.name ?? '';
  const behaviorFor = (id: string) => behaviors.find((b) => b.id === id);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['12'] }}>
        <Text variant="headline">Günlük</Text>
        <IconButton name="plus" accessibilityLabel="Yeni not" onPress={() => router.push('/(tabs)/journal/new')} />
      </View>

      <View style={{ flexDirection: 'row', gap: tokens.spacing['8'], marginBottom: tokens.spacing['16'], flexWrap: 'wrap' }}>
        <Chip label="Tümü" compact selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="İstekler" compact selected={filter === 'events'} onPress={() => setFilter('events')} />
        <Chip label="Notlar" compact selected={filter === 'notes'} onPress={() => setFilter('notes')} />
        {openCount > 0 ? <Chip label={`Sonucu ekle · ${openCount}`} compact selected={filter === 'open'} onPress={() => setFilter('open')} tone="amber" /> : null}
      </View>

      {groups.length === 0 ? (
        <Card padded>
          <EmptyState
            icon="book-open"
            title={filter === 'notes' ? 'Henüz not yok' : filter === 'open' ? 'Sonuçsuz kayıt yok' : 'Henüz kayıt yok'}
            description={filter === 'notes' ? 'İstediğinde, istediğin kadar.' : 'İlk kaydın buraya gelecek.'}
            actionLabel={filter === 'notes' ? 'Yeni not' : 'İstek kaydet'}
            onAction={() => (filter === 'notes' ? router.push('/(tabs)/journal/new') : router.push('/quick-log'))}
          />
        </Card>
      ) : (
        <View style={{ gap: tokens.spacing['20'] }}>
          {groups.map(([day, items]) => (
            <View key={day}>
              <Text variant="caption" color="tertiary" style={{ marginBottom: tokens.spacing['8'], textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {formatDayHeading(day)}
              </Text>
              <View style={{ gap: tokens.spacing['8'] }}>
                {items.map((it) =>
                  it.kind === 'event' ? (
                    <Pressable key={it.event.id} onPress={() => router.push({ pathname: '/event-detail', params: { id: it.event.id } })} accessibilityRole="button">
                      <Card padded>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
                          <View style={{ width: 32, height: 32, borderRadius: tokens.radius.xs, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="wind" size={16} color={colors.indigo} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text variant="label" numberOfLines={1}>
                              {behaviorName(it.event.behaviorId)}
                              <Text variant="caption" color="tertiary">
                                {'  '}
                                {formatClock(it.event.startedAt)}
                              </Text>
                            </Text>
                            {it.event.triggers.length || it.event.note ? (
                              <Text variant="caption" color="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
                                {[...it.event.triggers.map((t) => resolveChipLabel(TRIGGER_CHIPS, t)), it.event.note].filter(Boolean).join(' · ')}
                              </Text>
                            ) : null}
                          </View>
                          <OutcomeBadge
                            outcome={it.event.outcome}
                            resistedLabel={behaviorFor(it.event.behaviorId)?.verbResist}
                            actedLabel={behaviorFor(it.event.behaviorId)?.verbDid}
                          />
                        </View>
                      </Card>
                    </Pressable>
                  ) : (
                    <Pressable key={it.entry.id} onPress={() => router.push({ pathname: '/(tabs)/journal/[id]', params: { id: it.entry.id } })} accessibilityRole="button">
                      <Card padded>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing['12'] }}>
                          <View style={{ width: 32, height: 32, borderRadius: tokens.radius.xs, backgroundColor: colors.violetSoft, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="feather" size={16} color={colors.violet} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text variant="body" numberOfLines={3}>
                              {it.entry.text}
                            </Text>
                            <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'] }}>
                              {formatClock(it.entry.createdAt)}
                              {it.entry.tag ? ` · ${resolveChipLabel(JOURNAL_TAG_CHIPS, it.entry.tag)}` : ''}
                              {it.entry.mood ? ` · ${resolveChipLabel(MOOD_CHIPS, it.entry.mood)}` : ''}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  )
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
