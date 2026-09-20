import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Sheet, SheetActions, Text, Input, Button, ChipGroup } from '@/components/ui';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { questionForDate } from '@/content/library';
import { CHECKIN_PROMPTS } from '@/content/chips';
import { usageKey } from '@/utils/chips';

/** Daily check-in — chips first, a line of text only if you want it (H10/İstek 2). */
export default function DailyCheckInSheet() {
  const router = useRouter();
  const { tokens } = useTheme();
  const submitCheckIn = useAppStore((s) => s.submitCheckIn);
  const bumpChipUsage = useAppStore((s) => s.bumpChipUsage);
  const question = questionForDate();
  const prompt = useMemo(() => CHECKIN_PROMPTS.find((p) => p.question === question) ?? CHECKIN_PROMPTS[0], [question]);

  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState('');

  const close = () => router.back();

  const save = (skip: boolean) => {
    if (skip) {
      submitCheckIn(null, true);
      close();
      return;
    }
    const labels = picked.map((id) => resolveChipLabel(prompt.chips, id)).filter(Boolean) as string[];
    const answer = [labels.join(' · '), text.trim()].filter(Boolean).join(' — ');
    submitCheckIn(answer || null, false);
    bumpChipUsage(picked.map((id) => usageKey('checkin', id)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toast.show({ message: 'Check-in kaydedildi', tone: 'success' });
    close();
  };

  return (
    <Sheet onClose={close} title={question} subtitle="Zorunlu değil. Bir dokunuş yeter.">
      <ChipGroup mode="multi" options={prompt.chips} namespace="checkin" value={picked} onChange={setPicked} max={3} allowCustom />
      <View style={{ marginTop: tokens.spacing['16'] }}>
        <Input placeholder="Eklemek istersen bir cümle (opsiyonel)" value={text} onChangeText={setText} maxLength={200} />
      </View>
      <SheetActions>
        <View style={{ flex: 1 }}>
          <Button label="Şimdi değil" variant="ghost" onPress={() => save(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Kaydet" onPress={() => save(false)} />
        </View>
      </SheetActions>
      <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['12'] }}>
        Boş kaydetmek de geçerli.
      </Text>
    </Sheet>
  );
}
