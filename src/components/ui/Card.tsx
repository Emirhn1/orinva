import React from 'react';
import { View, ViewProps } from 'react-native';
import { Surface } from './Surface';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

interface Props extends ViewProps {
  title?: string;
  caption?: string;
  padded?: boolean;
  hero?: boolean; // xl radius, for Journey/onboarding hero cards
  accent?: 'none' | 'violet'; // §30 AI insight left-border accent
}

export function Card({ title, caption, padded = true, hero = false, accent = 'none', style, children, ...rest }: Props) {
  const { tokens, colors } = useTheme();
  return (
    <Surface
      radius={hero ? 'xl' : 'lg'}
      elevated
      style={[
        {
          padding: padded ? tokens.spacing['20'] : 0,
          borderLeftWidth: accent === 'violet' ? 4 : undefined,
          borderLeftColor: accent === 'violet' ? colors.violet : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {(title || caption) && (
        <View style={{ marginBottom: tokens.spacing['12'], flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          {title ? <Text variant="title">{title}</Text> : <View />}
          {caption ? <Text variant="caption" color="tertiary">{caption}</Text> : null}
        </View>
      )}
      {children}
    </Surface>
  );
}
