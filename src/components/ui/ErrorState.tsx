import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/icons';
import { Text } from './Typography';
import { Button } from './Button';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Bir şeyler ters gitti', description = 'Tekrar denemek ister misin?', onRetry }: Props) {
  const { colors, tokens } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: tokens.spacing['48'], paddingHorizontal: tokens.spacing['24'] }}>
      <Icon name="alert-circle" size={28} color={colors.terracotta} />
      <Text variant="title" style={{ marginTop: tokens.spacing['16'], textAlign: 'center' }}>
        {title}
      </Text>
      <Text variant="body" color="secondary" style={{ marginTop: tokens.spacing['8'], textAlign: 'center' }}>
        {description}
      </Text>
      {onRetry ? (
        <View style={{ marginTop: tokens.spacing['20'], width: '100%' }}>
          <Button label="Tekrar dene" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
