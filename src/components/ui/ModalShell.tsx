import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';
import { ProgressBar } from './ProgressBar';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  onClose?: () => void;
  progress?: number; // 0..1, shown as the onboarding-style segmented line (§38/§31)
  footer?: React.ReactNode; // e.g. persistent "Kriz desteği" link in Craving-Help
  children: React.ReactNode;
}

/**
 * Full-screen modal shell for Craving-Help, Relapse & Recovery and similar
 * single-focus flows — DESIGN.md §31: flat background, no imagery, one
 * decision per screen, generous vertical rhythm.
 */
export function ModalShell({ onClose, progress, footer, children }: Props) {
  const { colors, tokens } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: tokens.spacing['20'], paddingTop: tokens.spacing['8'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: tokens.componentHeight.topNav }}>
          {progress !== undefined ? (
            <View style={{ flex: 1, marginRight: tokens.spacing['16'] }}>
              <ProgressBar progress={progress} />
            </View>
          ) : (
            <View />
          )}
          {onClose ? <IconButton name="x" onPress={onClose} accessibilityLabel="Kapat" /> : null}
        </View>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: tokens.spacing['20'], justifyContent: 'center', paddingVertical: tokens.spacing['24'] }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      {footer ? (
        <View style={{ paddingHorizontal: tokens.spacing['20'], paddingBottom: tokens.spacing['24'], alignItems: 'center' }}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function ModalQuestion({ text }: { text: string }) {
  return (
    <Text variant="headline" style={{ marginBottom: 32 }}>
      {text}
    </Text>
  );
}
