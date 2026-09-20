import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Surface } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';

export default function MilestoneCelebration() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const pendingMilestone = useAppStore((s) => s.pendingMilestone);
  const dismissPendingMilestone = useAppStore((s) => s.dismissPendingMilestone);
  const acknowledgeMilestone = useAppStore((s) => s.acknowledgeMilestone);

  const close = () => {
    if (pendingMilestone) acknowledgeMilestone(pendingMilestone.id);
    dismissPendingMilestone();
    router.back();
  };

  if (!pendingMilestone) return null;

  return (
    <Sheet onClose={close}>
      <View style={{ alignItems: 'center', paddingVertical: tokens.spacing['16'] }}>
        <Surface
          radius="pill"
          style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.bronze }}
        >
          <Icon name="award" size={32} color={colors.bronze} />
        </Surface>
        <Text variant="title" style={{ marginTop: tokens.spacing['20'] }}>{pendingMilestone.label} oldu</Text>
        <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], textAlign: 'center' }}>
          Bunu sen yaptın.
        </Text>
        <View style={{ marginTop: tokens.spacing['24'], width: '100%' }}>
          <Button label="Devam et" onPress={close} />
        </View>
      </View>
    </Sheet>
  );
}
