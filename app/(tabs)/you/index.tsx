import React, { useMemo, useState } from 'react';
import { View, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, Badge, Input, Chip } from '@/components/ui';
import { Icon, IconName } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { ThemePreference } from '@/design/ThemeProvider';

function Row({ icon, label, right, onPress, hint }: { icon: IconName; label: string; right?: React.ReactNode; onPress?: () => void; hint?: string }) {
  const { colors, tokens } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={label}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: tokens.spacing['12'], gap: tokens.spacing['12'] }}>
        <Icon name={icon} size={20} color={colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text variant="body">{label}</Text>
          {hint ? (
            <Text variant="caption" color="tertiary">
              {hint}
            </Text>
          ) : null}
        </View>
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
  const events = useAppStore((s) => s.events);
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);

  const behaviors = useMemo(() => allBehaviors.filter((b) => !b.archived), [allBehaviors]);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.displayName);

  const themeOptions: { id: ThemePreference; label: string }[] = [
    { id: 'system', label: 'Sistem' },
    { id: 'light', label: 'Açık' },
    { id: 'dark', label: 'Koyu' },
  ];

  const saveName = () => {
    updateSetting('displayName', nameDraft.trim());
    setEditingName(false);
    toast.show({ message: nameDraft.trim() ? `Merhaba, ${nameDraft.trim()}` : 'İsim kaldırıldı', tone: 'success' });
  };

  const divider = <View style={{ height: 1, backgroundColor: colors.border }} />;

  return (
    <ScreenContainer>
      <Text variant="headline" style={{ marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        Sen
      </Text>

      <Card padded>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="title">{settings.displayName ? settings.displayName : 'Takma ad yok'}</Text>
            <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'] }}>
              {behaviors.length} aktif davranış · {events.length} kayıt · hepsi bu cihazda
            </Text>
          </View>
          {!editingName ? (
            <Text variant="label" color="indigo" onPress={() => setEditingName(true)} accessibilityRole="button">
              {settings.displayName ? 'Değiştir' : 'Ekle'}
            </Text>
          ) : null}
        </View>
        {editingName ? (
          <View style={{ marginTop: tokens.spacing['12'], gap: tokens.spacing['8'] }}>
            <Input placeholder="Sana nasıl seslenelim?" value={nameDraft} onChangeText={setNameDraft} maxLength={24} autoFocus onSubmitEditing={saveName} returnKeyType="done" />
            <View style={{ flexDirection: 'row', gap: tokens.spacing['8'] }}>
              <Chip label="Kaydet" selected onPress={saveName} />
              <Chip
                label="Vazgeç"
                onPress={() => {
                  setNameDraft(settings.displayName);
                  setEditingName(false);
                }}
              />
            </View>
          </View>
        ) : null}
      </Card>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Card padded>
          <Row icon="feather" label="Kendime notlar" hint="Nedenlerin — zor anda karşına çıkar" onPress={() => router.push('/(tabs)/you/notes')} />
          {divider}
          <Row icon="compass" label="Davranışlarım" hint="Düzenle, arşivle, kazanç sayacı" onPress={() => router.push('/(tabs)/journey/behaviors')} />
        </Card>
      </View>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
          Görünüm
        </Text>
        <Card padded>
          <View style={{ flexDirection: 'row', gap: tokens.spacing['8'] }}>
            {themeOptions.map((opt) => (
              <View key={opt.id} style={{ flex: 1 }}>
                <Chip label={opt.label} selected={settings.themePreference === opt.id} onPress={() => updateSetting('themePreference', opt.id)} />
              </View>
            ))}
          </View>
        </Card>
      </View>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
          Gizlilik & Bildirimler
        </Text>
        <Card padded>
          <Row
            icon="bell"
            label="Bildirimler"
            hint="Günün sözü ve nazik hatırlatmalar — yakında"
            right={<Switch value={settings.notificationsEnabled} onValueChange={(v) => updateSetting('notificationsEnabled', v)} trackColor={{ true: colors.indigo }} />}
          />
          {divider}
          <Row
            icon="lock"
            label="Uygulama kilidi"
            hint="PIN / biyometrik — yakında"
            right={<Switch value={settings.appLockEnabled} onValueChange={(v) => updateSetting('appLockEnabled', v)} trackColor={{ true: colors.indigo }} />}
          />
          {divider}
          <Row icon="shield" label="Gizlilik & Güvenlik" onPress={() => router.push('/(tabs)/you/privacy')} />
        </Card>
      </View>

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Card padded>
          <Row icon="download" label="Verilerimi dışa aktar / sil" onPress={() => router.push('/(tabs)/you/data')} />
          {divider}
          <Row icon="star" label="Premium" right={<Badge label="Yakında" />} />
        </Card>
      </View>

      <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['24'], textAlign: 'center' }}>
        ORINVA bir destek aracıdır, klinik tedavi değildir.
      </Text>
    </ScreenContainer>
  );
}
