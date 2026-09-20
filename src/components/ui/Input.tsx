import React, { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, onBlur, ...rest }: Props) {
  const { colors, tokens } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label ? (
        <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          {
            height: tokens.componentHeight.input,
            borderRadius: tokens.radius.sm,
            paddingHorizontal: tokens.spacing['16'],
            backgroundColor: focused ? colors.surface : colors.surfaceSecondary,
            borderWidth: focused ? 1.5 : error ? 1 : 0,
            borderColor: error ? colors.terracotta : colors.indigo,
            color: colors.textPrimary,
            fontSize: tokens.typography.body.fontSize,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color="terracotta" style={{ marginTop: tokens.spacing['4'] }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
