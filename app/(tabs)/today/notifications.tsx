import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, IconButton, EmptyState } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';

export default function NotificationsScreen() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <ScreenContainer edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Bildirimler</Text>
      </View>
      <EmptyState icon="bell" title="Henüz bildirim yok" description="Günün sözü ve nazik hatırlatmalar bir sonraki sürümde." actionLabel="Bildirim ayarları" onAction={() => router.push('/(tabs)/you')} />
    </ScreenContainer>
  );
}
