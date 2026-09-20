import React from 'react';
import { View } from 'react-native';
import { Icon, IconName } from '@/icons';
import { Text } from './Typography';
import { Button } from './Button';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  const { colors, tokens } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: tokens.spacing['48'], paddingHorizontal: tokens.spacing['24'] }}>
      <Icon name={icon} size={28} color={colors.textTertiary} />
      <Text variant="title" style={{ marginTop: tokens.spacing['16'], textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], textAlign: 'center' }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: tokens.spacing['20'], width: '100%' }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
