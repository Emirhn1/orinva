import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';

export default function PrivacyScreen() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Gizlilik & Güvenlik</Text>
      </View>

      <Card padded>
        <Text variant="label">Local-first</Text>
        <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'] }}>
          Tüm kayıtların — dürtüler, journal, nedenler — yalnızca bu cihazda, şifreli bir veritabanında tutulur.
          Hesap açman gerekmez ve varsayılan olarak hiçbir veri cihazdan çıkmaz.
        </Text>
      </Card>

      <Card padded style={{ marginTop: tokens.spacing['16'] }}>
        <Text variant="label">AI ve senkron</Text>
        <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'] }}>
          Bu sürümde AI ve bulut senkronu kapalıdır. İleride açılırsa, ayrı ve geri alınabilir bir onay isteyeceğiz.
        </Text>
      </Card>
    </ScreenContainer>
  );
}
