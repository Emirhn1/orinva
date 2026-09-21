import React, { useState } from 'react';
import { View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, Button } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { exportAllData } from '@/data/db';

export default function DataScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const behaviors = useAppStore((s) => s.behaviors);
  const events = useAppStore((s) => s.events);
  const wipeAllData = useAppStore((s) => s.wipeAllData);
  const [exporting, setExporting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const doExport = async () => {
    setExporting(true);
    try {
      const data = exportAllData();
      const file = new File(Paths.cache, `orinva-export-${Date.now()}.json`);
      file.write(JSON.stringify(data, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'ORINVA verilerini dışa aktar' });
      }
    } finally {
      setExporting(false);
    }
  };

  const doDelete = () => {
    wipeAllData();
    router.replace('/onboarding');
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Verilerim</Text>
      </View>

      <Card padded>
        <Text variant="label">Dışa aktar</Text>
        <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'], marginBottom: tokens.spacing['16'] }}>
          {behaviors.length} davranış, {events.length} kayıt — JSON dosyası olarak.
        </Text>
        <Button label="Verilerimi dışa aktar" variant="secondary" loading={exporting} onPress={doExport} />
      </Card>

      <Card padded style={{ marginTop: tokens.spacing['20'] }}>
        <Text variant="label" color="terracotta">Cihazdaki tüm verileri sil</Text>
        <Text variant="caption" color="secondary" style={{ marginTop: tokens.spacing['4'], marginBottom: tokens.spacing['16'] }}>
          ORINVA'da hesap yok — bu, cihazındaki her şeyi siler: davranışlar, kayıtlar, günlük yazıların, nedenlerin, check-in'lerin, kilometre taşların, bildirim ve favori sözlerin dahil tüm ayarların. Bu işlem geri alınamaz.
        </Text>
        {!confirmingDelete ? (
          <Button label="Tüm verileri sil" variant="critical" onPress={() => setConfirmingDelete(true)} />
        ) : (
          <View style={{ gap: tokens.spacing['12'] }}>
            <Text variant="body" color="terracotta">Emin misin? Cihazdaki tüm ORINVA verileri kalıcı olarak silinecek, bu geri alınamaz.</Text>
            <Button label="Evet, kalıcı olarak sil" variant="critical" onPress={doDelete} />
            <Button label="Vazgeç" variant="ghost" onPress={() => setConfirmingDelete(false)} />
          </View>
        )}
      </Card>
    </ScreenContainer>
  );
}
