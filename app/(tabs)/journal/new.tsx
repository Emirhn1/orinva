import React, { useMemo, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Text, TextArea, IconButton, ChipGroup, MoodSelector, Button } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { JOURNAL_TAG_CHIPS, CHECKIN_PROMPTS } from '@/content/chips';
import { usageKey } from '@/utils/chips';

const PROMPTS: Record<string, string> = {
  free: 'Şu an ne oldu?',
  morning_intent: 'Bugün için tek bir niyet?',
  evening_review: 'Bugün kendin için yaptığın küçük şey neydi?',
  slip_review: 'Ne oldu, ne hissettin, bir dahaki sefere ne denersin?',
  win: 'Bugün hangi küçük başarıyı görmezden geldin?',
};

/**
 * H4 — the composer is no longer a blank page. Tag → optional mood → a
 * prompted text area; "win" entries additionally offer the check-in chips so
 * a note can be one tap.
 */
export default function JournalComposer() {
  const router = useRouter();
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ eventId?: string; tag?: string }>();
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);

  const [tag, setTag] = useState<string | null>(params.tag && JOURNAL_TAG_CHIPS.some((c) => c.id === params.tag) ? params.tag : 'free');
  const [mood, setMood] = useState<string | null>(null);
  const [winChips, setWinChips] = useState<string[]>([]);
  const [text, setText] = useState('');

  const winPrompt = useMemo(() => CHECKIN_PROMPTS[3], []);
  const canSave = text.trim().length > 0 || winChips.length > 0;

  const save = () => {
    if (!canSave) {
      router.back();
      return;
    }
    const chipText = winChips.map((id) => winPrompt.chips.find((c) => c.id === id)?.label ?? id).join(' · ');
    const body = [chipText, text.trim()].filter(Boolean).join('\n');
    addJournalEntry({ text: body, linkedEventId: params.eventId || null, tag, mood });
    bumpChipUsage([...(tag ? [usageKey('journal_tag', tag)] : []), ...winChips.map((id) => usageKey('checkin', id))]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toast.show({ message: 'Not kaydedildi', tone: 'success' });
    router.back();
  };

  return (
    <ScreenContainer scroll={false} fabClearance={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['12'] }}>
        <IconButton name="x" accessibilityLabel="İptal" onPress={() => router.back()} />
        <Text variant="label" color={canSave ? 'indigo' : 'tertiary'} onPress={save} accessibilityRole="button">
          Kaydet
        </Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tokens.spacing['32'] }}>
          <ChipGroup mode="single" options={JOURNAL_TAG_CHIPS} namespace="journal_tag" value={tag} onChange={(v) => setTag(v ?? 'free')} tone="violet" />

          {tag === 'win' ? (
            <View style={{ marginTop: tokens.spacing['20'] }}>
              <ChipGroup mode="multi" label={winPrompt.question} options={winPrompt.chips} namespace="checkin" value={winChips} onChange={setWinChips} max={3} />
            </View>
          ) : null}

          <View style={{ marginTop: tokens.spacing['20'] }}>
            <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
              Nasıl hissediyorsun? <Text variant="caption" color="tertiary">opsiyonel</Text>
            </Text>
            <MoodSelector value={mood} onChange={setMood} />
          </View>

          <View style={{ marginTop: tokens.spacing['24'] }}>
            <TextArea bare autoFocus={tag !== 'win'} placeholder={PROMPTS[tag ?? 'free']} value={text} onChangeText={setText} style={{ minHeight: 140 }} />
          </View>

          <View style={{ marginTop: tokens.spacing['16'] }}>
            <Button label="Kaydet" onPress={save} disabled={!canSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
