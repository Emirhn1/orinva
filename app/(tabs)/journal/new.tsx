import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Text, TextArea, IconButton } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';

export default function JournalComposer() {
  const router = useRouter();
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ behaviorId?: string }>();
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const [text, setText] = useState('');

  const save = () => {
    if (text.trim().length === 0) {
      router.back();
      return;
    }
    addJournalEntry(text.trim());
    router.back();
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['16'] }}>
        <IconButton name="x" accessibilityLabel="İptal" onPress={() => router.back()} />
        <Text variant="label" color="indigo" onPress={save}>Kaydet</Text>
      </View>
      <TextArea
        bare
        autoFocus
        placeholder="Şu an ne oldu?"
        value={text}
        onChangeText={setText}
        style={{ flex: 1 }}
      />
    </ScreenContainer>
  );
}
