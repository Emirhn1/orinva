import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Text, Card, IconButton, EmptyState, Button, ChipGroup, Input } from '@/components/ui';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { WHY_CHIPS } from '@/content/chips';
import { usageKey } from '@/utils/chips';

/** Reasons vault (F2 source). Chips first; a sentence of your own if you want. */
export default function ReasonsVaultScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const reasons = useAppStore((s) => s.reasons);
  const addReason = useAppStore((s) => s.addReason);
  const removeReason = useAppStore((s) => s.removeReason);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);
  const [picked, setPicked] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const save = () => {
    const labels = picked.map((id) => resolveChipLabel(WHY_CHIPS, id)).filter(Boolean) as string[];
    if (draft.trim()) labels.push(draft.trim());
    if (!labels.length) {
      setAdding(false);
      return;
    }
    labels.forEach((t) => addReason(null, 'reason', t));
    bumpChipUsage(picked.map((id) => usageKey('why', id)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toast.show({ message: labels.length === 1 ? 'Neden eklendi' : `${labels.length} neden eklendi`, tone: 'success' });
    setPicked([]);
    setDraft('');
    setAdding(false);
  };

  const remove = (id: string, text: string) => {
    removeReason(id);
    toast.show({ message: 'Silindi', icon: 'refresh-cw', actionLabel: 'Geri al', durationMs: tokens.motion.undoWindow, onAction: () => addReason(null, 'reason', text) });
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Kendime notlar</Text>
      </View>

      <Text variant="body" color="secondary" style={{ marginBottom: tokens.spacing['16'] }}>
        Bu değişim sana ne kazandırsın? Zor anda kendi sözlerin karşına çıkar — jenerik motivasyondan kat kat etkili.
      </Text>

      {reasons.length === 0 && !adding ? (
        <Card padded>
          <EmptyState icon="feather" title="Henüz bir nedenin yok" description="Bir dokunuşla ekle; zor anda karşına çıksın." actionLabel="Neden ekle" onAction={() => setAdding(true)} />
        </Card>
      ) : (
        <View style={{ gap: tokens.spacing['12'] }}>
          {reasons.map((r) => (
            <Card key={r.id} padded>
              <Text variant="bodyLarge" serif>
                {r.text}
              </Text>
              <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['8'] }} onPress={() => remove(r.id, r.text)} accessibilityRole="button">
                Sil
              </Text>
            </Card>
          ))}
        </View>
      )}

      {adding ? (
        <Card padded style={{ marginTop: tokens.spacing['16'] }}>
          <ChipGroup mode="multi" options={WHY_CHIPS} namespace="why" value={picked} onChange={setPicked} max={3} />
          <View style={{ marginTop: tokens.spacing['12'] }}>
            <Input placeholder="Ya da kendi cümlenle…" value={draft} onChangeText={setDraft} maxLength={120} />
          </View>
          <View style={{ flexDirection: 'row', gap: tokens.spacing['12'], marginTop: tokens.spacing['16'] }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Vazgeç"
                variant="ghost"
                onPress={() => {
                  setAdding(false);
                  setPicked([]);
                  setDraft('');
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Kaydet" onPress={save} disabled={!picked.length && !draft.trim()} />
            </View>
          </View>
        </Card>
      ) : reasons.length > 0 ? (
        <View style={{ marginTop: tokens.spacing['16'] }}>
          <Button label="Yeni neden ekle" variant="secondary" onPress={() => setAdding(true)} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
