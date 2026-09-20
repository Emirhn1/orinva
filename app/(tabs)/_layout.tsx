import React from 'react';
import { View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/icons';
import { EmergencyFAB } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';

export default function TabsLayout() {
  const { colors, tokens } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const hideFab = pathname.startsWith('/you');

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.indigo,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            height: tokens.componentHeight.bottomNav + insets.bottom,
            paddingTop: tokens.spacing['8'],
            paddingBottom: insets.bottom,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: { fontSize: tokens.typography.caption.fontSize, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="today"
          options={{ title: 'Bugün', tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color as string} /> }}
        />
        <Tabs.Screen
          name="journey"
          options={{ title: 'Yolculuk', tabBarIcon: ({ color }) => <Icon name="trending-up" size={24} color={color as string} /> }}
        />
        <Tabs.Screen
          name="journal"
          options={{ title: 'Günlük', tabBarIcon: ({ color }) => <Icon name="book-open" size={24} color={color as string} /> }}
        />
        <Tabs.Screen
          name="you"
          options={{ title: 'Sen', tabBarIcon: ({ color }) => <Icon name="user" size={24} color={color as string} /> }}
        />
      </Tabs>
      {!hideFab && (
        <EmergencyFAB
          onPress={() => router.push('/craving-help')}
          bottomOffset={tokens.componentHeight.bottomNav + insets.bottom + tokens.spacing['12']}
        />
      )}
    </View>
  );
}
