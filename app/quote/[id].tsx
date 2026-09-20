import React, { useMemo, useState } from 'react';
import { View, Share, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, IconButton, Chip } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { findQuote } from '@/notifications/quoteEngine';
import { QUOTE_CATEGORY_LABEL } from '@/content/quotes';

/**
 * Tapping a quote notification (or the Today card) lands here: one quote,
 * big serif type, calm gradient — the single gradient exception outside
 * onboarding (DESIGN.md §36) because this is a "moment", not a screen.
 */
export default function QuoteScreen() {
  const router = useRouter();
  const { colors, tokens, mode } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userQuotes = useAppStore((s) => s.userQuotes);
  const reasons = useAppStore((s) => s.reasons);
  const quoteMeta = useAppStore((s) => s.quoteMeta);
  const prefs = useAppStore((s) => s.notificationPrefs);
  const toggleFavoriteQuote = useAppStore((s) => s.toggleFavoriteQuote);
  const hideQuote = useAppStore((s) => s.hideQuote);
  const updateNotificationPrefs = useAppStore((s) => s.updateNotificationPrefs);
  const [hidden, setHidden] = useState(false);

  const quote = useMemo(() => (id ? findQuote(id, userQuotes, reasons) : undefined), [id, userQuotes, reasons]);
  const meta = quoteMeta.find((m) => m.quoteId === id);
  const isFavorite = !!meta?.isFavorite;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/today'));

  if (!quote) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: tokens.spacing['24'] }}>
        <Text variant="title">Bu söz artık burada değil</Text>
        <Text variant="label" color="indigo" style={{ marginTop: tokens.spacing['16'] }} onPress={close}>
          Kapat
        </Text>
      </SafeAreaView>
    );
  }

  const favorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleFavoriteQuote(quote.id);
    toast.show({ message: isFavorite ? 'Favorilerden çıkarıldı' : 'Cesaret arşivine eklendi', tone: 'success' });
  };

  const share = async () => {
    const text = quote.author ? `“${quote.text}” — ${quote.author}` : `“${quote.text}”`;
    try {
      await Share.share({ message: `${text}\n\n— ORINVA` });
    } catch {
      /* user dismissed */
    }
  };

  const hide = () => {
    hideQuote(quote.id);
    setHidden(true);
    toast.show({ message: 'Bu söz bir daha gösterilmeyecek', icon: 'info' });
    setTimeout(close, 300);
  };

  const lessCategory = () => {
    updateNotificationPrefs({ categories: { ...prefs.categories, [quote.category]: false } });
    toast.show({ message: `${QUOTE_CATEGORY_LABEL[quote.category]} kategorisi kapatıldı`, icon: 'info', actionLabel: 'Geri al', onAction: () => updateNotificationPrefs({ categories: { ...prefs.categories, [quote.category]: true } }) });
  };

  const gradient = mode === 'dark' ? (['#1C2247', '#0B0F19'] as const) : (['#EEF1FA', '#F4F5F9'] as const);
  const textColor = mode === 'dark' ? '#F0F2F8' : colors.textPrimary;
  const subColor = mode === 'dark' ? '#9AA2BC' : colors.textSecondary;

  return (
    <LinearGradient colors={[...gradient]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: tokens.spacing['24'] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: tokens.componentHeight.topNav }}>
          <Chip compact label={QUOTE_CATEGORY_LABEL[quote.category]} />
          <IconButton name="x" accessibilityLabel="Kapat" onPress={close} color={textColor} />
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text variant="display" serif style={{ color: textColor, fontSize: 30, lineHeight: 40, fontWeight: '500' }} maxFontSizeMultiplier={1.4}>
            {quote.text}
          </Text>
          {quote.author ? (
            <Text variant="body" style={{ color: subColor, marginTop: tokens.spacing['16'] }}>
              — {quote.author}
            </Text>
          ) : null}
        </View>

        <View style={{ paddingBottom: tokens.spacing['24'], gap: tokens.spacing['12'] }}>
          <View style={{ flexDirection: 'row', gap: tokens.spacing['12'] }}>
            <Action icon={isFavorite ? 'bookmark' : 'heart'} label={isFavorite ? 'Favoride' : 'Favorilere kaydet'} onPress={favorite} active={isFavorite} textColor={textColor} />
            <Action icon="send" label="Paylaş" onPress={share} textColor={textColor} />
          </View>
          {quote.category !== 'own' && quote.category !== 'lyrics' && !hidden ? (
            <View style={{ flexDirection: 'row', gap: tokens.spacing['16'], justifyContent: 'center', marginTop: tokens.spacing['8'] }}>
              <Text variant="caption" style={{ color: subColor }} onPress={hide} accessibilityRole="button">
                Bunu bir daha gösterme
              </Text>
              <Text variant="caption" style={{ color: subColor }} onPress={lessCategory} accessibilityRole="button">
                Bu kategoriyi kapat
              </Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Action({ icon, label, onPress, active, textColor }: { icon: 'heart' | 'bookmark' | 'send'; label: string; onPress: () => void; active?: boolean; textColor: string }) {
  const { colors, tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        minHeight: 48,
        borderRadius: tokens.radius.md,
        borderWidth: 1,
        borderColor: active ? colors.indigo : 'rgba(128,140,180,0.35)',
        backgroundColor: active ? colors.indigo : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing['8'],
      }}
    >
      <Icon name={icon} size={18} color={active ? colors.onAccent : textColor} />
      <Text variant="label" style={{ color: active ? colors.onAccent : textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}
