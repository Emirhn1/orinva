import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

interface Props extends ViewProps {
  variant?: 'base' | 'secondary' | 'raised';
  radius?: keyof ReturnType<typeof useTheme>['tokens']['radius'];
  bordered?: boolean;
  elevated?: boolean; // uses DESIGN.md §9 surface shadow (light mode only, tonal in dark)
}

export function Surface({ variant = 'base', radius = 'lg', bordered = false, elevated = false, style, children, ...rest }: Props) {
  const { colors, tokens, mode } = useTheme();
  const bg =
    variant === 'secondary' ? colors.surfaceSecondary : variant === 'raised' ? colors.surfaceRaised : colors.surface;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: tokens.radius[radius],
          borderWidth: bordered || mode === 'dark' ? StyleSheet.hairlineWidth * 1.5 : 0,
          borderColor: colors.border,
        },
        elevated ? colors.shadowSurface : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
