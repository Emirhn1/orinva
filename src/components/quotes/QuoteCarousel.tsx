import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Text } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { BUILTIN_QUOTES, Quote, QUOTE_CATEGORY_LABEL } from '@/content/quotes';
import { QuoteMeta } from '@/data/types';

export function QuoteCarousel({ featured, meta, onFavorite }: { featured: Quote; meta: QuoteMeta[]; onFavorite: (id: string) => void }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors, tokens } = useTheme();
  const cardWidth = Math.min(520, width - tokens.spacing['40']);
  const [index, setIndex] = useState(0);
  const items = useMemo(() => {
    const visible = BUILTIN_QUOTES.filter((item) => !meta.find((entry) => entry.quoteId === item.id)?.hiddenAt && item.id !== featured.id);
    const offset = Math.abs(featured.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % Math.max(1, visible.length);
    return [featured, ...visible.slice(offset).concat(visible.slice(0, offset)).slice(0, 4)];
  }, [featured, meta]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(event.nativeEvent.contentOffset.x / cardWidth));

  return (
    <View style={{ marginHorizontal: -tokens.spacing['20'], marginTop: tokens.spacing['16'], marginBottom: tokens.spacing['16'] }}>
      <View style={{ paddingHorizontal: tokens.spacing['20'], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing['8'] }}>
        <View>
          <Text variant="title">Günün sözü</Text>
          <Text variant="caption" color="tertiary">Kaydır, keşfet, sana iyi geleni sakla.</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/today/quotes')} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text variant="label" color="indigo">Tümünü gör</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        pagingEnabled
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{ paddingHorizontal: tokens.spacing['20'] }}
        renderItem={({ item, index: itemIndex }) => {
          const favorite = !!meta.find((entry) => entry.quoteId === item.id)?.isFavorite;
          return (
            <View style={{ width: cardWidth, paddingRight: itemIndex === items.length - 1 ? 0 : tokens.spacing['8'] }}>
              <Card padded style={{ minHeight: 168, backgroundColor: itemIndex === 0 ? colors.surfaceRaised : colors.surface }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="caption" color={item.contentType === 'story' ? 'slateBlue' : 'indigo'}>{itemIndex === 0 ? 'BUGÜNÜN SEÇİMİ' : QUOTE_CATEGORY_LABEL[item.category].toLocaleUpperCase('tr-TR')}</Text>
                  <Pressable onPress={() => onFavorite(item.id)} hitSlop={12} accessibilityRole="button" accessibilityLabel={favorite ? 'Favoriden çıkar' : 'Favorilere ekle'}>
                    <Icon name={favorite ? 'bookmark' : 'heart'} size={20} color={favorite ? colors.indigo : colors.textSecondary} />
                  </Pressable>
                </View>
                <Pressable onPress={() => router.push({ pathname: '/quote/[id]', params: { id: item.id } })} accessibilityRole="button" style={{ flex: 1, justifyContent: 'center', paddingVertical: tokens.spacing['16'] }}>
                  {item.title ? <Text variant="label" color="secondary" numberOfLines={1} style={{ marginBottom: tokens.spacing['8'] }}>{item.title}</Text> : null}
                  <Text variant="bodyLarge" serif style={{ fontSize: item.contentType === 'story' ? 16 : 18, lineHeight: item.contentType === 'story' ? 23 : 26 }} numberOfLines={item.contentType === 'story' ? 3 : 4}>{item.text}</Text>
                  {item.author ? <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['12'] }}>— {item.author}</Text> : null}
                </Pressable>
              </Card>
            </View>
          );
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: tokens.spacing['4'], marginTop: tokens.spacing['8'] }}>
        {items.map((item, dot) => <View key={item.id} style={{ width: dot === index ? 16 : 5, height: 5, borderRadius: 3, backgroundColor: dot === index ? colors.indigo : colors.borderStrong }} />)}
      </View>
    </View>
  );
}
