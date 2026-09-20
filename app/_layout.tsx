import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { ToastHost } from '@/components/ui';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { mode, colors } = useTheme();
  const pendingMilestone = useAppStore((s) => s.pendingMilestone);
  const router = useRouter();

  useEffect(() => {
    if (pendingMilestone) {
      router.push('/milestone-celebration');
    }
  }, [pendingMilestone]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="craving-help" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="wave-mode" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="delay-timer" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="relapse-recovery" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="behavior-builder" options={{ presentation: 'modal' }} />
        <Stack.Screen name="daily-checkin" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="quick-log" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="event-detail" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="milestone-celebration" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
      <ToastHost />
    </View>
  );
}

function ThemedApp() {
  const { setPreference } = useTheme();
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    setPreference(settings.themePreference);
  }, [settings.themePreference]);

  return <RootNavigator />;
}

export default function RootLayout() {
  const boot = useAppStore((s) => s.boot);
  const ready = useAppStore((s) => s.ready);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    boot();
  }, []);

  useEffect(() => {
    if (ready && !splashHidden) {
      SplashScreen.hideAsync().catch(() => {});
      setSplashHidden(true);
    }
  }, [ready, splashHidden]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
