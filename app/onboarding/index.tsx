import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <LinearGradient colors={['#1C2247', '#0B0F19']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: tokens.spacing['20'], paddingBottom: tokens.spacing['24'] }}>
        <View />
        <View style={{ alignItems: 'flex-start', gap: tokens.spacing['20'] }}>
          <View style={{ width: 64, height: 64, borderRadius: tokens.radius.lg, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wind" size={32} color="#F0F2F8" />
          </View>
          <Text variant="display" style={{ color: '#F0F2F8' }}>ORINVA</Text>
          <Text variant="bodyLarge" style={{ color: '#C3C8DA' }}>
            Kayıtların önce cihazında kalır. Hesap açmadan başlayabilirsin.
          </Text>
          <Text variant="body" style={{ color: '#9AA2BC' }}>
            İstemediğin bir davranışa yaklaşırken küçük bir duraklama yarat; olanı yargısız kaydet; zamanla kendi örüntünü gör.
          </Text>
        </View>
        <Button label="Devam et" onPress={() => router.push('/onboarding/focus')} />
      </SafeAreaView>
    </LinearGradient>
  );
}
