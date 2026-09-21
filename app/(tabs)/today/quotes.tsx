import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Chip, EmptyState, IconButton, ScreenContainer, Text } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { allQuotes } from '@/notifications/quoteEngine';
import { QUOTE_CATEGORY_LABEL } from '@/content/quotes';

type Filter = 'all' | 'quote' | 'lyric' | 'story' | 'favorite' | 'hidden';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tümü' }, { id: 'quote', label: 'Sözler' }, { id: 'lyric', label: 'Şarkılar' },
  { id: 'story', label: 'Hikâyeler' }, { id: 'favorite', label: 'Favoriler' }, { id: 'hidden', label: 'Gizlenenler' },
];

export default function QuotesLibraryScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const userQuotes = useAppStore((s) => s.userQuotes);
  const reasons = useAppStore((s) => s.reasons);
  const meta = useAppStore((s) => s.quoteMeta);
  const toggleFavorite = useAppStore((s) => s.toggleFavoriteQuote);
  const unhide = useAppStore((s) => s.unhideQuote);
  const [filter, setFilter] = useState<Filter>('all');
  const items = useMemo(() => allQuotes(userQuotes, reasons).filter((item) => {
    const state = meta.find((entry) => entry.quoteId === item.id);
    if (filter === 'favorite') return !!state?.isFavorite;
    if (filter === 'hidden') return !!state?.hiddenAt;
    if (state?.hiddenAt) return false;
    if (filter === 'all') return true;
    return item.contentType === filter || (filter === 'quote' && item.contentType === 'user');
  }), [filter, meta, reasons, userQuotes]);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <View style={{ flex: 1 }}><Text variant="title">Söz vitrini</Text><Text variant="caption" color="tertiary">60 seçki ve kendi sözlerin</Text></View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
        {FILTERS.map((item) => <Chip key={item.id} compact label={item.label} selected={filter === item.id} onPress={() => setFilter(item.id)} />)}
      </View>
      {!items.length ? <Card padded><EmptyState icon="book-open" title="Bu bölüm henüz boş" /></Card> : (
        <View style={{ gap: tokens.spacing['12'] }}>
          {items.map((item) => {
            const state = meta.find((entry) => entry.quoteId === item.id);
            return (
              <Pressable key={item.id} onPress={() => filter === 'hidden' ? unhide(item.id) : router.push({ pathname: '/quote/[id]', params: { id: item.id } })} accessibilityRole="button">
                <Card padded>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing['12'] }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="caption" color="tertiary">{item.title ?? QUOTE_CATEGORY_LABEL[item.category]}</Text>
                      <Text variant="bodyLarge" serif numberOfLines={item.contentType === 'story' ? 3 : 4} style={{ marginTop: tokens.spacing['8'] }}>{item.text}</Text>
                      {item.author ? <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['8'] }}>— {item.author}</Text> : null}
                    </View>
                    {filter === 'hidden' ? <Text variant="label" color="indigo">Geri al</Text> : (
                      <Pressable onPress={(event) => { event.stopPropagation(); toggleFavorite(item.id); }} hitSlop={10}><Icon name={state?.isFavorite ? 'bookmark' : 'heart'} size={20} color={state?.isFavorite ? colors.indigo : colors.textTertiary} /></Pressable>
                    )}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
