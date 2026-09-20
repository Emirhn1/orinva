import React, { useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView, View, ViewStyle, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/design/ThemeProvider';
import { useFabStore } from '@/store/useFabStore';

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
  const setCollapsed = useFabStore((s) => s.setCollapsed);
  const lastY = useRef(0);

  // A freshly focused screen always starts with the full-width CTA.
  useFocusEffect(
    useCallback(() => {
      setCollapsed(false);
      lastY.current = 0;
    }, [setCollapsed])
  );

  const padding = {
    paddingHorizontal: tokens.spacing['20'],
    paddingBottom: fabClearance ? tokens.componentHeight.fabClearance + tokens.spacing['16'] : tokens.spacing['48'],
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!fabClearance) return;
    const y = e.nativeEvent.contentOffset.y;
    const delta = y - lastY.current;
    if (y <= 8) setCollapsed(false);
    else if (delta > 6) setCollapsed(true);
    else if (delta < -6) setCollapsed(false);
    lastY.current = y;
  };

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          onMomentumScrollEnd={() => setCollapsed(false)}
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
