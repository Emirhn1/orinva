import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { mode, colors, tokens } = useTheme();
  const gradient = mode === 'dark' ? (['#1C2247', '#0B0F19'] as const) : (['#FFFFFF', '#EEF1FA'] as const);

  return (
    <LinearGradient colors={[...gradient]} style={{ flex: 1 }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: tokens.spacing['20'], paddingBottom: tokens.spacing['24'] }}>
        <View />
        <View style={{ alignItems: 'flex-start', gap: tokens.spacing['20'] }}>
          <View style={{ width: 64, height: 64, borderRadius: tokens.radius.lg, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wind" size={32} color={colors.indigo} />
          </View>
          <Text variant="display">ORINVA</Text>
          <Text variant="bodyLarge" color="secondary">
            Kayıtların önce cihazında kalır. Hesap açmadan başlayabilirsin.
          </Text>
          <Text variant="body" color="tertiary">
            İstemediğin bir davranışa yaklaşırken küçük bir duraklama yarat; olanı yargısız kaydet; zamanla kendi örüntünü gör.
          </Text>
        </View>
        <Button label="Devam et" onPress={() => router.push('/onboarding/focus')} />
      </SafeAreaView>
    </LinearGradient>
  );
}
