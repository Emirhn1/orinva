import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
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

const serifFamily = 'Lora_500Medium';

/**
 * DESIGN.md §39: text must reflow up to 130% scale without truncation. Large
 * display/stat styles cap a little lower so hero numbers don't overflow on
 * 200% accessibility settings; body copy is allowed to grow further.
 */
const maxScale: Record<Variant, number> = {
  display: 1.3,
  headline: 1.3,
  title: 1.4,
  bodyLarge: 1.6,
  body: 1.6,
  label: 1.5,
  caption: 1.5,
  statLarge: 1.2,
  statSmall: 1.3,
};

export function Text({ variant = 'body', color = 'primary', serif = false, tabular = false, style, children, ...rest }: Props) {
  const { colors, tokens } = useTheme();
  const t = tokens.typography[variant];
  return (
    <RNText
      maxFontSizeMultiplier={maxScale[variant]}
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
