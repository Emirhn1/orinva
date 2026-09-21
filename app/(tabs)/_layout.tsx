import React from 'react';
import { View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/icons';
import { EmergencyFAB, Text } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';

/**
 * Selected tab must read as selected without relying on tint color alone
 * (color-blind / low-contrast readability) — a soft pill behind the icon
 * plus a bolder label carry the state too.
 */
function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  const { colors, tokens } = useTheme();
  return (
    <View
      style={{
        width: 40,
        height: 26,
        borderRadius: tokens.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.surfaceSecondary : 'transparent',
      }}
    >
      <Icon name={name} size={22} color={color} strokeWidth={focused ? 2.1 : 1.6} />
    </View>
  );
}

function TabLabel({ label, color, focused }: { label: string; color: import('react-native').ColorValue; focused: boolean }) {
  const { tokens } = useTheme();
  return (
    <Text variant="caption" style={{ color, fontSize: tokens.typography.caption.fontSize, fontWeight: focused ? '700' : '500', marginTop: 2 }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { colors, tokens } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Hidden on Sen (settings context) and on the journal composer (keyboard-first screen).
  const hideFab = pathname.startsWith('/you') || pathname.endsWith('/journal/new');

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
          tabBarLabelStyle: { fontSize: tokens.typography.caption.fontSize },
        }}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: 'Bugün',
            tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color as string} focused={focused} />,
            tabBarLabel: ({ color, focused }) => <TabLabel label="Bugün" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="journey"
          options={{
            title: 'Yolculuk',
            tabBarIcon: ({ color, focused }) => <TabIcon name="trending-up" color={color as string} focused={focused} />,
            tabBarLabel: ({ color, focused }) => <TabLabel label="Yolculuk" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Günlük',
            tabBarIcon: ({ color, focused }) => <TabIcon name="book-open" color={color as string} focused={focused} />,
            tabBarLabel: ({ color, focused }) => <TabLabel label="Günlük" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="you"
          options={{
            title: 'Sen',
            tabBarIcon: ({ color, focused }) => <TabIcon name="user" color={color as string} focused={focused} />,
            tabBarLabel: ({ color, focused }) => <TabLabel label="Sen" color={color} focused={focused} />,
          }}
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
