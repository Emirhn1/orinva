import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Text, Card, IconButton, EmptyState, Button, Chip, Input, TextArea } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { allQuotes } from '@/notifications/quoteEngine';
import { QUOTE_CATEGORY_LABEL } from '@/content/quotes';

type Tab = 'favorites' | 'mine' | 'hidden';

/**
 * F17 / Plan §5.1 "Favoriler koleksiyonu" — the user's own courage archive:
 * favourited quotes, quotes they wrote themselves (including their own song
 * lyrics), and a place to un-hide quotes they dismissed.
 */
export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const userQuotes = useAppStore((s) => s.userQuotes);
  const reasons = useAppStore((s) => s.reasons);
  const quoteMeta = useAppStore((s) => s.quoteMeta);
  const toggleFavoriteQuote = useAppStore((s) => s.toggleFavoriteQuote);
  const unhideQuote = useAppStore((s) => s.unhideQuote);
  const addUserQuote = useAppStore((s) => s.addUserQuote);
  const removeUserQuote = useAppStore((s) => s.removeUserQuote);

  const [tab, setTab] = useState<Tab>('favorites');
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState<'own' | 'lyrics'>('own');
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  const quotes = useMemo(() => allQuotes(userQuotes, reasons), [userQuotes, reasons]);
  const favorites = useMemo(() => quotes.filter((q) => quoteMeta.find((m) => m.quoteId === q.id)?.isFavorite), [quotes, quoteMeta]);
  const hidden = useMemo(() => quotes.filter((q) => quoteMeta.find((m) => m.quoteId === q.id)?.hiddenAt), [quotes, quoteMeta]);

  const save = () => {
    if (!text.trim()) return;
    const q = addUserQuote(category, text.trim(), author.trim() || null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toast.show({ message: 'Eklendi', tone: 'success', actionLabel: 'Geri al', onAction: () => removeUserQuote(q.id) });
    setText('');
    setAuthor('');
    setAdding(false);
    setTab('mine');
  };

  const list = tab === 'favorites' ? favorites : tab === 'mine' ? quotes.filter((q) => q.category === 'own' || q.category === 'lyrics') : hidden;

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title" style={{ flex: 1 }}>
          Cesaret arşivi
        </Text>
        <IconButton name="plus" accessibilityLabel="Kendi sözünü ekle" onPress={() => setAdding(true)} />
      </View>

      <View style={{ flexDirection: 'row', gap: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
        <Chip compact label={`Favoriler · ${favorites.length}`} selected={tab === 'favorites'} onPress={() => setTab('favorites')} />
        <Chip compact label="Kendi sözlerim" selected={tab === 'mine'} onPress={() => setTab('mine')} />
        {hidden.length ? <Chip compact label={`Gizlenen · ${hidden.length}`} selected={tab === 'hidden'} onPress={() => setTab('hidden')} /> : null}
      </View>

      {adding ? (
        <Card padded style={{ marginBottom: tokens.spacing['16'] }}>
          <View style={{ flexDirection: 'row', gap: tokens.spacing['8'], marginBottom: tokens.spacing['12'] }}>
            <Chip label="Kendi sözüm" selected={category === 'own'} onPress={() => setCategory('own')} />
            <Chip label="Şarkı sözü" selected={category === 'lyrics'} onPress={() => setCategory('lyrics')} tone="violet" />
          </View>
          <TextArea placeholder={category === 'lyrics' ? 'Sana iyi gelen bir-iki dize' : 'Zor anda okumak istediğin bir cümle'} value={text} onChangeText={setText} maxLength={280} style={{ minHeight: 90 }} />
          <View style={{ marginTop: tokens.spacing['8'] }}>
            <Input placeholder={category === 'lyrics' ? 'Sanatçı / şarkı (opsiyonel)' : 'Kime ait? (opsiyonel)'} value={author} onChangeText={setAuthor} maxLength={60} />
          </View>
          {category === 'lyrics' ? (
            <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['8'] }}>
              Sadece kendi telefonunda kalır; kısa alıntı + künye en güvenlisi.
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['16'] }}>
            <View style={{ flex: 1 }}>
              <Button label="Vazgeç" variant="ghost" onPress={() => setAdding(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Kaydet" onPress={save} disabled={!text.trim()} />
            </View>
          </View>
        </Card>
      ) : null}

      {list.length === 0 ? (
        <Card padded>
          <EmptyState
            icon={tab === 'favorites' ? 'heart' : tab === 'mine' ? 'feather' : 'bookmark'}
            title={tab === 'favorites' ? 'Henüz favori yok' : tab === 'mine' ? 'Henüz kendi sözün yok' : 'Gizlenen söz yok'}
            description={tab === 'favorites' ? 'Bir sözün altındaki kalbe dokun; burada birikir.' : 'Nedenlerin otomatik olarak buraya gelir; istersen kendi cümleni de ekle.'}
            actionLabel={tab === 'mine' ? 'Kendi sözünü ekle' : undefined}
            onAction={tab === 'mine' ? () => setAdding(true) : undefined}
          />
        </Card>
      ) : (
        <View style={{ gap: tokens.spacing['12'] }}>
          {list.map((q) => {
            const meta = quoteMeta.find((m) => m.quoteId === q.id);
            const isUser = q.id.startsWith('u-');
            return (
              <Pressable key={q.id} onPress={() => router.push({ pathname: '/quote/[id]', params: { id: q.id } })} accessibilityRole="button">
                <Card padded>
                  <Text variant="bodyLarge" serif>
                    {q.text}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['12'] }}>
                    <Text variant="caption" color="tertiary" style={{ flex: 1 }}>
                      {QUOTE_CATEGORY_LABEL[q.category]}
                      {q.author ? ` · ${q.author}` : ''}
                    </Text>
                    {tab === 'hidden' ? (
                      <Text variant="label" color="indigo" onPress={() => unhideQuote(q.id)} accessibilityRole="button">
                        Geri aç
                      </Text>
                    ) : (
                      <>
                        <Pressable onPress={() => toggleFavoriteQuote(q.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={meta?.isFavorite ? 'Favoriden çıkar' : 'Favorilere ekle'}>
                          <Icon name={meta?.isFavorite ? 'bookmark' : 'heart'} size={18} color={meta?.isFavorite ? colors.indigo : colors.textTertiary} />
                        </Pressable>
                        {isUser ? (
                          <Text
                            variant="caption"
                            color="tertiary"
                            onPress={() => {
                              const snapshot = q;
                              removeUserQuote(q.id);
                              toast.show({ message: 'Silindi', icon: 'refresh-cw', actionLabel: 'Geri al', onAction: () => addUserQuote(snapshot.category as 'own' | 'lyrics', snapshot.text, snapshot.author ?? null) });
                            }}
                            accessibilityRole="button"
                          >
                            Sil
                          </Text>
                        ) : null}
                      </>
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
