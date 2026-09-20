import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Card, IconButton, EmptyState, Badge, Button, SectionHeader } from '@/components/ui';
import { Icon } from '@/icons';
import { useTheme } from '@/design/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cleanDuration } from '@/utils/journey';
import { formatDuration } from '@/utils/date';
import { useNow } from '@/utils/useNow';
import { GOAL_LABEL, behaviorTypeLabel } from '@/content/behaviors';
import { Behavior } from '@/data/types';

export default function BehaviorsScreen() {
  const router = useRouter();
  const { colors, tokens } = useTheme();
  const now = useNow(60_000);
  const behaviors = useAppStore((s) => s.behaviors);
  const unarchiveBehavior = useAppStore((s) => s.unarchiveBehavior);

  const active = useMemo(() => behaviors.filter((b) => !b.archived), [behaviors]);
  const archived = useMemo(() => behaviors.filter((b) => b.archived), [behaviors]);

  const Row = ({ behavior: b }: { behavior: Behavior }) => {
    const { id, name, goalMode, archived: isArchived } = b;
    const d = cleanDuration(b, now);
    return (
      <Pressable onPress={() => router.push({ pathname: '/(tabs)/journey/[id]', params: { id } })} accessibilityRole="button" accessibilityLabel={name}>
          <Card padded style={{ borderLeftWidth: 4, borderLeftColor: colors[b.color] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing['12'] }}>
            <View style={{ flex: 1 }}>
              <Text variant="label" numberOfLines={1}>
                {name}
              </Text>
              <Text variant="caption" color="tertiary" numberOfLines={1}>
                {behaviorTypeLabel(b.category)}
              </Text>
              <Text variant="caption" color="secondary" tabular>
                {isArchived ? 'Arşivde' : formatDuration(d.totalMinutes, 'long')}
              </Text>
            </View>
            {isArchived ? (
              <Text variant="label" color="indigo" onPress={() => unarchiveBehavior(id)} accessibilityRole="button">
                Geri aç
              </Text>
            ) : (
              <Badge label={GOAL_LABEL[goalMode]} tone="slateBlue" />
            )}
            <Icon name="chevron-right" size={18} color={colors.textTertiary} />
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['12'], marginTop: tokens.spacing['8'], marginBottom: tokens.spacing['20'] }}>
        <IconButton name="chevron-left" accessibilityLabel="Geri" onPress={() => router.back()} />
        <Text variant="title">Davranışların</Text>
      </View>

      {active.length === 0 ? (
        <Card padded>
          <EmptyState icon="compass" title="Henüz davranış yok" description="İlk davranışını ekleyerek başla." actionLabel="Davranış ekle" onAction={() => router.push('/behavior-builder')} />
        </Card>
      ) : (
        <View style={{ gap: tokens.spacing['12'] }}>
          {active.map((b) => (
            <Row key={b.id} behavior={b} />
          ))}
        </View>
      )}

      <View style={{ marginTop: tokens.spacing['20'] }}>
        <Button label="Yeni davranış ekle" variant="secondary" onPress={() => router.push('/behavior-builder')} />
      </View>

      {archived.length > 0 ? (
        <View style={{ marginTop: tokens.spacing['32'] }}>
          <SectionHeader title="Arşiv" />
          <View style={{ gap: tokens.spacing['12'] }}>
            {archived.map((b) => (
              <Row key={b.id} behavior={b} />
            ))}
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
