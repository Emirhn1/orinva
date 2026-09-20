import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, EmptyState, Badge } from '@/components/ui';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cleanDuration } from '@/utils/journey';

export default function BehaviorsScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const behaviors = useAppStore((s) => s.behaviors);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Davranışların</Text>
      </View>

      {behaviors.length === 0 ? (
        <EmptyState icon="compass" title="Henüz davranış yok" actionLabel="Ekle" onAction={() => router.push('/behavior-builder')} />
      ) : (
        <View style={{ gap: tokens.spacing['12'] }}>
          {behaviors.map((b) => {
            const d = cleanDuration(b);
            return (
              <Pressable key={b.id} onPress={() => router.push({ pathname: '/(tabs)/journey/[id]', params: { id: b.id } })}>
                <Card padded>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text variant="label">{b.name}</Text>
                      <Text variant="caption" color="secondary">{d.days} gün {d.hours} sa temiz</Text>
                    </View>
                    {b.archived ? <Badge label="Arşivde" /> : null}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Card padded>
          <Text variant="label" onPress={() => router.push('/behavior-builder')}>+ Yeni davranış ekle</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}
