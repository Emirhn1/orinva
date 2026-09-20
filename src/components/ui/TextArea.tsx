import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

interface Props extends TextInputProps {
  bare?: boolean; // full-bleed journal composer style, no visible box (DESIGN.md §28)
}

export function TextArea({ bare = false, style, ...rest }: Props) {
  const { colors, tokens } = useTheme();
  return (
    <TextInput
      multiline
      textAlignVertical="top"
      placeholderTextColor={colors.textTertiary}
      style={[
        bare
          ? {
              backgroundColor: 'transparent',
              color: colors.textPrimary,
              fontSize: tokens.typography.bodyLarge.fontSize,
              lineHeight: tokens.typography.bodyLarge.lineHeight,
              minHeight: 160,
            }
          : {
              backgroundColor: colors.surfaceSecondary,
              borderRadius: tokens.radius.sm,
              padding: tokens.spacing['16'],
              color: colors.textPrimary,
              fontSize: tokens.typography.body.fontSize,
              minHeight: 100,
            },
        style,
      ]}
      {...rest}
    />
  );
}
