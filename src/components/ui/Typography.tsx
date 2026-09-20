import React from 'react';
import { Text as RNText, TextProps, Platform } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';

type Variant = 'display' | 'headline' | 'title' | 'bodyLarge' | 'body' | 'label' | 'caption' | 'statLarge' | 'statSmall';
type ColorRole = 'primary' | 'secondary' | 'tertiary' | 'onAccent' | 'success' | 'amber' | 'terracotta' | 'violet' | 'slateBlue' | 'indigo';

interface Props extends TextProps {
  variant?: Variant;
  color?: ColorRole;
  serif?: boolean;
  tabular?: boolean;
  children: React.ReactNode;
}

const colorKey: Record<ColorRole, string> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  tertiary: 'textTertiary',
  onAccent: 'onAccent',
  success: 'success',
  amber: 'amber',
  terracotta: 'terracotta',
  violet: 'violet',
  slateBlue: 'slateBlue',
  indigo: 'indigo',
};

const serifFamily = Platform.select({ ios: 'New York', android: 'serif', default: undefined });

export function Text({ variant = 'body', color = 'primary', serif = false, tabular = false, style, children, ...rest }: Props) {
  const { colors, tokens } = useTheme();
  const t = tokens.typography[variant];
  return (
    <RNText
      style={[
        {
          fontSize: t.fontSize,
          fontWeight: t.fontWeight,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          color: (colors as any)[colorKey[color]] ?? colors.textPrimary,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
          fontFamily: serif ? serifFamily : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
