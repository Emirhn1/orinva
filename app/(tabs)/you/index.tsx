import React, { useMemo } from 'react';
import { View, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, Badge } from '@/components/ui';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { ThemePreference } from '@/design/ThemeProvider';

function Row({ icon, label, right, onPress }: { icon: IconName; label: string; right?: React.ReactNode; onPress?: () => void }) {
  const { colors, tokens } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: tokens.spacing['12'], gap: tokens.spacing['12'] }}>
        <Icon name={icon} size={20} color={colors.textSecondary} />
        <Text variant="body" style={{ flex: 1 }}>{label}</Text>
        {right}
        {onPress && !right ? <Icon name="chevron-right" size={18} color={colors.textTertiary} /> : null}
      </View>
    </Pressable>
  );
}

export default function YouScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const allBehaviors = useAppStore((s) => s.behaviors);
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);

  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);

  const themeOptions: { id: ThemePreference; label: string }[] = [
    { id: 'system', label: 'Sistem' },
    { id: 'light', label: 'Açık' },
    { id: 'dark', label: 'Koyu' },
  ];

  return (
    <ScreenContainer>
      <Text variant="headline" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>Sen</Text>

      <Card padded>
        <Text variant="title">{behaviors.length} aktif davranış</Text>
        <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
          Tüm verilerin bu cihazda, şifreli olarak tutulur.
        </Text>
      </Card>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Card padded>
          <Row icon="feather" label="Kendime notlar" onPress={() => router.push('/(tabs)/you/notes')} />
        </Card>
      </View>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>Görünüm</Text>
        <Card padded>
          <View style={{ flexDirection: 'row', gap: tokens.spacing['8'] }}>
            {themeOptions.map((opt) => {
              const selected = settings.themePreference === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => updateSetting('themePreference', opt.id)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: tokens.radius.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? colors.indigo : colors.surfaceSecondary,
                  }}
                >
                  <Text variant="label" color={selected ? 'onAccent' : 'secondary'}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </View>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>Gizlilik & Bildirimler</Text>
        <Card padded>
          <Row
            icon="bell"
            label="Bildirimler"
            right={<Switch value={settings.notificationsEnabled} onValueChange={(v) => updateSetting('notificationsEnabled', v)} trackColor={{ true: colors.indigo }} />}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row
            icon="lock"
            label="Uygulama kilidi"
            right={<Switch value={settings.appLockEnabled} onValueChange={(v) => updateSetting('appLockEnabled', v)} trackColor={{ true: colors.indigo }} />}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row icon="shield" label="Gizlilik & Güvenlik" onPress={() => router.push('/(tabs)/you/privacy')} />
        </Card>
      </View>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Card padded>
          <Row icon="download" label="Verilerimi dışa aktar / sil" onPress={() => router.push('/(tabs)/you/data')} />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row icon="star" label="Premium" right={<Badge label="V1.1" />} />
        </Card>
      </View>
    </ScreenContainer>
  );
}
