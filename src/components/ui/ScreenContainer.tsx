import React from 'react';
import { ScrollView, View, ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/design/ThemeProvider';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Reserve space for the floating "Zor An" CTA (H1). Default on — turn off inside modals. */
  fabClearance?: boolean;
}

export function ScreenContainer({ children, scroll = true, edges = ['top'], contentStyle, refreshing, onRefresh, fabClearance = true }: Props) {
  const { colors, tokens } = useTheme();
  const padding = {
    paddingHorizontal: tokens.spacing['20'],
    paddingBottom: fabClearance ? tokens.componentHeight.fabClearance + tokens.spacing['16'] : tokens.spacing['48'],
  };

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.indigo} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
