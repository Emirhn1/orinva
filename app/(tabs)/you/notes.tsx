import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, EmptyState, Button, TextArea } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';

export default function ReasonsVaultScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const reasons = useAppStore((s) => s.reasons);
  const addReason = useAppStore((s) => s.addReason);
  const removeReason = useAppStore((s) => s.removeReason);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const save = () => {
    if (draft.trim()) addReason(null, 'reason', draft.trim());
    setDraft('');
    setAdding(false);
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Kendime notlar</Text>
      </View>

      {reasons.length === 0 && !adding ? (
        <EmptyState icon="feather" title="Henüz bir notun yok" actionLabel="Not ekle" onAction={() => setAdding(true)} />
      ) : (
        <View style={{ gap: tokens.spacing['12'] }}>
          {reasons.map((r) => (
            <Card key={r.id} padded>
              <Text variant="bodyLarge" serif>{r.text}</Text>
              <Text variant="caption" color="terracotta" style={{ marginTop: tokens.spacing['8'] }} onPress={() => removeReason(r.id)}>
                Sil
              </Text>
            </Card>
          ))}
        </View>
      )}

      {adding ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          <TextArea placeholder="Bu değişim sana ne kazandırsın?" value={draft} onChangeText={setDraft} autoFocus />
          <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['12'] }}>
            <View style={{ flex: 1 }}><Button label="Vazgeç" variant="ghost" onPress={() => { setAdding(false); setDraft(''); }} /></View>
            <View style={{ flex: 1 }}><Button label="Kaydet" onPress={save} /></View>
          </View>
        </Card>
      ) : reasons.length > 0 ? (
        <View style={{ marginTop: tokens.spacing['16'] }}>
          <Button label="Yeni not ekle" variant="secondary" onPress={() => setAdding(true)} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
