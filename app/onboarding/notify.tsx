import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalShell, Text, Button, Chip, Surface } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { requestPermission } from '@/notifications/native';
import { PRESET_TIMES } from '@/notifications/prefs';

/**
 * H3 — ask for notification permission at the end of onboarding, with the
 * reason in one sentence, and start with notifications ON. Skippable.
 */
export default function OnboardingNotify() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const updateNotificationPrefs = useAppStore((s) => s.updateNotificationPrefs);
  const setNotificationPermission = useAppStore((s) => s.setNotificationPermission);
  const [times, setTimes] = useState<string[]>(['08:00', '20:00']);
  const [busy, setBusy] = useState(false);

  const toggleTime = (t: string) => setTimes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t].sort()));

  const enable = async () => {
    setBusy(true);
    const p = await requestPermission();
    setNotificationPermission(p);
    // Even when the OS says no, keep the preference on: the settings page shows how to fix it.
    updateNotificationPrefs({ enabled: p !== 'unsupported', times: times.length ? times : ['08:00', '20:00'] });
    setBusy(false);
    router.push('/onboarding/demo');
  };

  const skip = () => {
    updateNotificationPrefs({ enabled: false, times });
    router.push('/onboarding/demo');
  };

  return (
    <ModalShell onClose={() => router.back()} progress={4 / 5}>
      <Text variant="headline">Doğru anda bir cümle</Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['24'] }}>
        Uygulamanın tüm değeri doğru anda hatırlatmak. Günde en fazla birkaç kısa bildirim; hiçbirinde davranışının adı geçmez.
      </Text>

      <Surface radius="lg" bordered style={{ padding: tokens.spacing['16'], gap: tokens.spacing['12'] }}>
        <Row icon="sun" text="Seçtiğin saatlerde günün sözü" />
        <Row icon="award" text="24 saat, 3 gün, 1 hafta… kilometre taşları" />
        <Row icon="clock" text="Zorlandığın saati öğrenince, öncesinde nazik bir destek" />
        <Row icon="moon" text="Gece 00:00–07:30 arası sessiz" />
      </Surface>

      <Text variant="label" color="secondary" style={{ marginTop: tokens.spacing['24'], marginBottom: tokens.spacing['8'] }}>
        Günün sözü ne zaman gelsin?
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'] }}>
        {PRESET_TIMES.map((t) => (
          <Chip key={t} label={t} selected={times.includes(t)} onPress={() => toggleTime(t)} />
        ))}
      </View>

      <View style={{ marginTop: tokens.spacing['32'], gap: tokens.spacing['12'] }}>
        <Button label={Platform.OS === 'web' ? 'Devam et' : 'Bildirimleri aç'} onPress={enable} loading={busy} />
        <Button label="Şimdi değil" variant="ghost" onPress={skip} />
      </View>
      <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['12'], textAlign: 'center' }}>
        İstediğin zaman Sen › Bildirimler'den değiştirebilirsin.
      </Text>
    </ModalShell>
  );

  function Row({ icon, text }: { icon: 'sun' | 'award' | 'clock' | 'moon'; text: string }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'] }}>
        <Icon name={icon} size={18} color={colors.indigo} />
        <Text variant="body" style={{ flex: 1 }}>
          {text}
        </Text>
      </View>
    );
  }
}
