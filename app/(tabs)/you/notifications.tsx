import React, { useMemo, useState } from 'react';
import { View, Switch, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, Button, Chip, Surface } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { requestPermission, sendTest } from '@/notifications/native';
import { rescheduleNotifications } from '@/notifications/scheduler';
import { KIND_LABEL, NotificationKind, PRESET_TIMES, MAX_TIMES, toHHMM } from '@/notifications/prefs';
import { QUOTE_CATEGORY_LABEL, QUOTE_CATEGORY_HINT, QuoteCategory } from '@/content/quotes';
import { formatClock } from '@/utils/date';

const KIND_ORDER: NotificationKind[] = ['quote', 'milestone', 'health', 'riskHour', 'postSlip', 'gentleReturn', 'weekly', 'earnings', 'insight'];
const CATEGORY_ORDER: QuoteCategory[] = ['own', 'aphorism', 'motivation', 'calm', 'science', 'health', 'lyrics'];
const HOURS = Array.from({ length: 24 }, (_, h) => toHHMM(h));

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const prefs = useAppStore((s) => s.notificationPrefs);
  const permission = useAppStore((s) => s.notificationPermission);
  const plan = useAppStore((s) => s.notificationPlan);
  const updateNotificationPrefs = useAppStore((s) => s.updateNotificationPrefs);
  const setNotificationPermission = useAppStore((s) => s.setNotificationPermission);
  const [pickingTime, setPickingTime] = useState(false);
  const [pickingQuiet, setPickingQuiet] = useState<'from' | 'to' | null>(null);
  const [testing, setTesting] = useState(false);

  const upcoming = useMemo(() => plan.filter((p) => p.at.getTime() > Date.now()).slice(0, 6), [plan]);

  const toggleMaster = async (v: boolean) => {
    if (!v) {
      updateNotificationPrefs({ enabled: false });
      return;
    }
    const p = await requestPermission();
    setNotificationPermission(p);
    if (p === 'granted') {
      updateNotificationPrefs({ enabled: true });
      toast.show({ message: 'Bildirimler açık', tone: 'success' });
    } else if (p === 'unsupported') {
      toast.show({ message: 'Bu platformda bildirim desteklenmiyor', icon: 'info' });
    } else {
      updateNotificationPrefs({ enabled: true });
      toast.show({ message: 'İzin verilmedi. Sistem ayarlarından açabilirsin.', icon: 'alert-circle', tone: 'terracotta', actionLabel: 'Ayarlar', onAction: () => Linking.openSettings().catch(() => {}) });
    }
  };

  const toggleKind = (k: NotificationKind, v: boolean) => updateNotificationPrefs({ kinds: { ...prefs.kinds, [k]: v } });
  const toggleCategory = (c: QuoteCategory, v: boolean) => updateNotificationPrefs({ categories: { ...prefs.categories, [c]: v } });

  const addTime = (t: string) => {
    setPickingTime(false);
    if (prefs.times.includes(t) || prefs.times.length >= MAX_TIMES) return;
    updateNotificationPrefs({ times: [...prefs.times, t].sort() });
  };
  const removeTime = (t: string) => updateNotificationPrefs({ times: prefs.times.filter((x) => x !== t) });

  const runTest = async () => {
    setTesting(true);
    const ok = await sendTest('Bugün küçük bir karar yeter.');
    setTesting(false);
    toast.show({ message: ok ? 'Test bildirimi 2 saniye içinde gelecek' : 'Bu platformda test gönderilemedi', icon: ok ? 'bell' : 'info' });
  };

  const divider = <View style={{ height: 1, backgroundColor: colors.border }} />;
  const disabled = !prefs.enabled;

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Bildirimler</Text>
      </View>

      <Card padded>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
          <Icon name="bell" size={20} color={colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text variant="body">Bildirimler</Text>
            <Text variant="caption" color="tertiary">
              {permission === 'denied' ? 'Sistem izni kapalı — Ayarlar > ORINVA' : 'Nazik, sessiz; günde en fazla 4, aralarında en az 90 dk.'}
            </Text>
          </View>
          <Switch value={prefs.enabled} onValueChange={toggleMaster} trackColor={{ true: colors.indigo }} />
        </View>
        {permission === 'denied' && prefs.enabled ? (
          <View style={{ marginTop: tokens.spacing['12'] }}>
            <Button label="Sistem ayarlarını aç" variant="secondary" onPress={() => Linking.openSettings().catch(() => {})} />
          </View>
        ) : null}
        {Platform.OS === 'android' ? (
          <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['12'] }}>
            Xiaomi / Oppo / Huawei gibi cihazlarda pil optimizasyonu bildirimleri engelleyebilir. ORINVA için "Kısıtlama yok" seçmen gerekebilir.
          </Text>
        ) : null}
      </Card>

      {/* Zamanlama */}
      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>
        Günün sözü saatleri
      </Text>
      <Card padded style={{ opacity: disabled ? tokens.opacity.disabled : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'] }}>
          {prefs.times.map((t) => (
            <Chip key={t} label={`${t}  ×`} selected onPress={() => removeTime(t)} accessibilityHint="Kaldırmak için dokun" />
          ))}
          {prefs.times.length < MAX_TIMES ? <Chip label="+ Saat ekle" onPress={() => setPickingTime((v) => !v)} /> : null}
        </View>
        {pickingTime ? (
          <View style={{ marginTop: tokens.spacing['12'] }}>
            <Text variant="caption" color="tertiary" style={{ marginBottom: tokens.spacing['8'] }}>
              Hazır
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'] }}>
              {PRESET_TIMES.filter((t) => !prefs.times.includes(t)).map((t) => (
                <Chip key={t} label={t} onPress={() => addTime(t)} compact />
              ))}
            </View>
            <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['12'], marginBottom: tokens.spacing['8'] }}>
              Kendi saatin
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['4'] }}>
              {HOURS.filter((t) => !prefs.times.includes(t)).map((t) => (
                <Chip key={t} label={t} onPress={() => addTime(t)} compact />
              ))}
            </View>
          </View>
        ) : null}
        <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['12'] }}>
          Günde en fazla {MAX_TIMES} saat. Aynı söz 30 gün tekrar etmez.
        </Text>
      </Card>

      {/* Rahatsız etmeyin */}
      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>
        Rahatsız etmeyin
      </Text>
      <Card padded style={{ opacity: disabled ? tokens.opacity.disabled : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['8'] }}>
          <Chip label={prefs.quietFrom} selected={pickingQuiet === 'from'} onPress={() => setPickingQuiet(pickingQuiet === 'from' ? null : 'from')} />
          <Text variant="caption" color="tertiary">
            →
          </Text>
          <Chip label={prefs.quietTo} selected={pickingQuiet === 'to'} onPress={() => setPickingQuiet(pickingQuiet === 'to' ? null : 'to')} />
          <Text variant="caption" color="tertiary" style={{ flex: 1 }}>
            arası sessiz
          </Text>
        </View>
        {pickingQuiet ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['4'], marginTop: tokens.spacing['12'] }}>
            {HOURS.concat(['07:30', '22:30', '23:30']).sort().map((t) => (
              <Chip
                key={t}
                label={t}
                compact
                selected={(pickingQuiet === 'from' ? prefs.quietFrom : prefs.quietTo) === t}
                onPress={() => {
                  updateNotificationPrefs(pickingQuiet === 'from' ? { quietFrom: t } : { quietTo: t });
                  setPickingQuiet(null);
                }}
              />
            ))}
          </View>
        ) : null}
      </Card>

      {/* Türler */}
      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>
        Ne zaman yazalım?
      </Text>
      <Card padded style={{ opacity: disabled ? tokens.opacity.disabled : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
        {KIND_ORDER.map((k, i) => (
          <View key={k}>
            {i > 0 ? divider : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: tokens.spacing['12'], gap: tokens.spacing['12'] }}>
              <View style={{ flex: 1 }}>
                <Text variant="body">{KIND_LABEL[k].title}</Text>
                <Text variant="caption" color="tertiary">
                  {KIND_LABEL[k].hint}
                </Text>
              </View>
              <Switch value={prefs.kinds[k]} onValueChange={(v) => toggleKind(k, v)} trackColor={{ true: colors.indigo }} />
            </View>
          </View>
        ))}
      </Card>

      {/* Kategoriler */}
      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>
        Söz kategorileri
      </Text>
      <Card padded style={{ opacity: disabled ? tokens.opacity.disabled : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
        {CATEGORY_ORDER.map((c, i) => (
          <View key={c}>
            {i > 0 ? divider : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: tokens.spacing['12'], gap: tokens.spacing['12'] }}>
              <View style={{ flex: 1 }}>
                <Text variant="body">{QUOTE_CATEGORY_LABEL[c]}</Text>
                <Text variant="caption" color="tertiary">
                  {QUOTE_CATEGORY_HINT[c]}
                </Text>
              </View>
              <Switch value={prefs.categories[c]} onValueChange={(v) => toggleCategory(c, v)} trackColor={{ true: colors.indigo }} />
            </View>
          </View>
        ))}
        <Text variant="label" color="indigo" style={{ marginTop: tokens.spacing['12'] }} onPress={() => router.push('/(tabs)/you/favorites')} accessibilityRole="button">
          Kendi sözlerini ekle →
        </Text>
      </Card>

      {/* Sıradakiler */}
      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>
        Sıradakiler
      </Text>
      <Card padded>
        {!prefs.enabled ? (
          <Text variant="caption" color="tertiary">
            Bildirimler kapalı.
          </Text>
        ) : upcoming.length === 0 ? (
          <Text variant="caption" color="tertiary">
            Plan hazırlanıyor… (web önizlemede bildirim planlanmaz)
          </Text>
        ) : (
          <View style={{ gap: tokens.spacing['8'] }}>
            {upcoming.map((p) => (
              <Surface key={p.key} radius="md" variant="secondary" style={{ padding: tokens.spacing['12'] }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text variant="caption" color="secondary">
                    {KIND_LABEL[p.kind].title}
                  </Text>
                  <Text variant="caption" color="tertiary" tabular>
                    {p.at.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })} · {formatClock(p.at.toISOString())}
                  </Text>
                </View>
                <Text variant="body" numberOfLines={2}>
                  {p.body}
                </Text>
              </Surface>
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: tokens.spacing['8'], marginTop: tokens.spacing['16'] }}>
          <View style={{ flex: 1 }}>
            <Button label="Planı yenile" variant="ghost" onPress={() => rescheduleNotifications().then(() => toast.show({ message: 'Plan yenilendi', tone: 'success' }))} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Test bildirimi" variant="secondary" loading={testing} onPress={runTest} />
          </View>
        </View>
      </Card>

      <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['24'], textAlign: 'center' }}>
        Bildirim önizlemesinde asla davranış adı ya da miktar geçmez.
      </Text>
    </ScreenContainer>
  );
}
