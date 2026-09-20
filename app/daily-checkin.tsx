import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, TextArea, Button } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { questionForDate } from '@/content/library';

export default function DailyCheckInSheet() {
  const router = useRouter();
  const { tokens } = useTheme();
  const submitCheckIn = useAppStore((s) => s.submitCheckIn);
  const [answer, setAnswer] = useState('');

  const close = () => router.back();

  const save = (skip: boolean) => {
    submitCheckIn(skip ? null : answer.trim() || null, skip);
    close();
  };

  return (
    <Sheet onClose={close}>
      <Text variant="title">{questionForDate()}</Text>
      <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['4'], marginBottom: tokens.spacing['16'] }}>
        Zorunlu değil. İstediğin kadar kısa olabilir.
      </Text>
      <TextArea placeholder="Yazmak istersen..." value={answer} onChangeText={setAnswer} style={{ minHeight: 90 }} />
      <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['20'] }}>
        <View style={{ flex: 1 }}>
          <Button label="Şimdi değil" variant="ghost" onPress={() => save(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Kaydet" onPress={() => save(false)} />
        </View>
      </View>
    </Sheet>
  );
}
