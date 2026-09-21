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
  guided_reflection: 'Rehberli düşünme',
  morning_intent: 'Bugün için tek bir niyet?',
  evening_review: 'Bugün kendin için yaptığın küçük şey neydi?',
  slip_review: 'Ne oldu, ne hissettin, bir dahaki sefere ne denersin?',
  win: 'Bugün hangi küçük başarıyı görmezden geldin?',
};

/**
 * H4 — the composer is no longer a blank page. Tag → optional mood → a
 * prompted text area; "win" entries additionally offer the check-in chips so
 * a note can be one tap. "Rehberli düşünme" swaps the single text area for a
 * three-step reflection (situation → thought → a more balanced look) that
 * can be saved as a draft and resumed later — no AI, just a static prompt.
 */
export default function JournalComposer() {
  const router = useRouter();
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ eventId?: string; tag?: string; id?: string }>();
  const entries = useAppStore((s) => s.journalEntries);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const updateJournalEntry = useAppStore((s) => s.updateJournalEntry);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);

  const editing = useMemo(() => (params.id ? entries.find((e) => e.id === params.id) ?? null : null), [entries, params.id]);

  const [tag, setTag] = useState<string | null>(
    editing?.tag ?? (params.tag && JOURNAL_TAG_CHIPS.some((c) => c.id === params.tag) ? params.tag : 'free')
  );
  const [mood, setMood] = useState<string | null>(editing?.mood ?? null);
  const [winChips, setWinChips] = useState<string[]>([]);
  const [text, setText] = useState(editing?.tag !== 'guided_reflection' ? editing?.text ?? '' : '');
  const [situation, setSituation] = useState(editing?.situation ?? '');
  const [thought, setThought] = useState(editing?.thought ?? '');
  const [reframe, setReframe] = useState(editing?.reframe ?? '');

  const winPrompt = useMemo(() => CHECKIN_PROMPTS[3], []);
  const isGuided = tag === 'guided_reflection';
  const canSave = isGuided ? situation.trim().length > 0 || thought.trim().length > 0 || reframe.trim().length > 0 : text.trim().length > 0 || winChips.length > 0;

  const buildGuidedText = () =>
    [
      situation.trim() ? `Ne oldu: ${situation.trim()}` : null,
      thought.trim() ? `O anki düşüncem: ${thought.trim()}` : null,
      reframe.trim() ? `Daha dengeli bir bakış: ${reframe.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

  const persist = (isDraft: boolean) => {
    if (isGuided) {
      const body = buildGuidedText();
      const payload = { text: body, tag, mood, situation: situation.trim() || null, thought: thought.trim() || null, reframe: reframe.trim() || null, isDraft };
      if (editing) updateJournalEntry(editing.id, payload);
      else addJournalEntry({ ...payload, linkedEventId: params.eventId || null });
      return;
    }
    const chipText = winChips.map((id) => winPrompt.chips.find((c) => c.id === id)?.label ?? id).join(' · ');
    const body = [chipText, text.trim()].filter(Boolean).join('\n');
    // A free-text save always finishes the entry, even if it started as a guided draft.
    const payload = { text: body, tag, mood, situation: null, thought: null, reframe: null, isDraft: false };
    if (editing) updateJournalEntry(editing.id, payload);
    else addJournalEntry({ ...payload, linkedEventId: params.eventId || null });
  };

  const save = () => {
    if (!canSave) {
      router.back();
      return;
    }
    persist(false);
    bumpChipUsage([...(tag ? [usageKey('journal_tag', tag)] : []), ...winChips.map((id) => usageKey('checkin', id))]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toast.show({ message: 'Not kaydedildi', tone: 'success' });
    router.back();
  };

  const saveDraft = () => {
    if (!canSave) {
      router.back();
      return;
    }
    persist(true);
    toast.show({ message: 'Taslak kaydedildi. Günlük\'ten devam edebilirsin.', icon: 'info' });
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

          {isGuided ? (
            <View style={{ marginTop: tokens.spacing['24'], gap: tokens.spacing['20'] }}>
              <Text variant="caption" color="tertiary">
                Üçü de opsiyonel — istediğin kadarını doldur, istersen taslak olarak bırak.
              </Text>
              <View>
                <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
                  Ne oldu?
                </Text>
                <TextArea placeholder="Durumu kısaca anlat" value={situation} onChangeText={setSituation} style={{ minHeight: 80 }} />
              </View>
              <View>
                <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
                  O anki düşüncen neydi?
                </Text>
                <TextArea placeholder="Aklından geçen ilk düşünce" value={thought} onChangeText={setThought} style={{ minHeight: 80 }} />
              </View>
              <View>
                <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
                  Daha dengeli bir bakış var mı?
                </Text>
                <TextArea placeholder="İstersen bu düşünceye alternatif bir açı dene" value={reframe} onChangeText={setReframe} style={{ minHeight: 80 }} />
              </View>
            </View>
          ) : (
            <View style={{ marginTop: tokens.spacing['24'] }}>
              <TextArea bare autoFocus={tag !== 'win'} placeholder={PROMPTS[tag ?? 'free']} value={text} onChangeText={setText} style={{ minHeight: 140 }} />
            </View>
          )}

          <View style={{ marginTop: tokens.spacing['16'], gap: tokens.spacing['8'] }}>
            <Button label="Kaydet" onPress={save} disabled={!canSave} />
            {isGuided ? <Button label="Taslak olarak kaydet, sonra devam et" variant="ghost" onPress={saveDraft} disabled={!canSave} /> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
