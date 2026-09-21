import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { ToastHost } from '@/components/ui';
import { startNotificationScheduler } from '@/notifications/scheduler';
import { subscribeResponses, ACTION_FAVORITE, ACTION_HIDE } from '@/notifications/native';
import { startWidgetSync } from '@/widgets/scheduler';
import { useFonts, Lora_500Medium } from '@expo-google-fonts/lora';

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

  // Part 3 — schedule local notifications and route their taps/actions.
  useEffect(() => {
    const stopScheduler = startNotificationScheduler();
    const stopResponses = subscribeResponses(({ action, data }) => {
      const store = useAppStore.getState();
      if (action === ACTION_FAVORITE && data.quoteId) {
        store.toggleFavoriteQuote(data.quoteId);
        toast.show({ message: 'Favorilere eklendi', tone: 'success' });
        return;
      }
      if (action === ACTION_HIDE && data.quoteId) {
        store.hideQuote(data.quoteId);
        toast.show({ message: 'Bu söz bir daha gösterilmeyecek', icon: 'info' });
        return;
      }
      switch (data.route) {
        case 'quote':
          if (data.quoteId) router.push({ pathname: '/quote/[id]', params: { id: data.quoteId } });
          break;
        case 'craving-help':
          router.push({ pathname: '/craving-help', params: data.behaviorId ? { behaviorId: data.behaviorId } : {} });
          break;
        case 'journey':
          router.push('/(tabs)/journey');
          break;
        default:
          router.push('/(tabs)/today');
      }
    });
    return () => {
      stopScheduler();
      stopResponses();
    };
  }, []);

  // Part 4 — keep the home/lock-screen widget in sync with the app (never a live counter).
  useEffect(() => startWidgetSync(), []);

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
        <Stack.Screen name="quote/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
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
  const [fontsLoaded, fontError] = useFonts({ Lora_500Medium });

  useEffect(() => {
    boot();
  }, []);

  useEffect(() => {
    if (ready && (fontsLoaded || fontError) && !splashHidden) {
      SplashScreen.hideAsync().catch(() => {});
      setSplashHidden(true);
    }
  }, [ready, fontsLoaded, fontError, splashHidden]);

  if (!ready || (!fontsLoaded && !fontError)) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
