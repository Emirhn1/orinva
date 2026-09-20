import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View, AccessibilityInfo, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/design/ThemeProvider';

/**
 * Two drifting wave layers whose water level rises and falls with the
 * breathing cycle. Both motions run on the native driver (translateX loop +
 * translateY breath) so the 3-minute session stays smooth even on older
 * phones. With OS reduce-motion on, the waves stay still and only the level
 * eases (DESIGN.md §38 fallback).
 */

export type BreathPhase = 'inhale' | 'exhale';

interface Props {
  /** Seconds for one inhale and one exhale (symmetrical). */
  breathSeconds?: number;
  running: boolean;
  onPhase?: (phase: BreathPhase) => void;
  height: number;
}

function wavePath(width: number, amplitude: number, height: number, phase = 0): string {
  // Two full periods across `width`, so translating by -width loops seamlessly.
  const period = width / 2;
  const quarter = period / 4;
  const baseline = amplitude + 2;
  let d = `M0,${baseline + Math.sin(phase) * 0}`;
  for (let i = 0; i < 4; i++) {
    const x0 = i * period;
    d += ` C${x0 + quarter},${baseline - amplitude} ${x0 + quarter},${baseline - amplitude} ${x0 + period / 2},${baseline}`;
    d += ` C${x0 + period / 2 + quarter},${baseline + amplitude} ${x0 + period / 2 + quarter},${baseline + amplitude} ${x0 + period},${baseline}`;
  }
  d += ` L${width * 2},${height} L0,${height} Z`;
  return d;
}

export function WaveField({ breathSeconds = 4, running, onPhase, height }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);

  const driftA = useRef(new Animated.Value(0)).current;
  const driftB = useRef(new Animated.Value(0)).current;
  const level = useRef(new Animated.Value(0)).current; // 0 = low (exhaled), 1 = high (inhaled)
  const breathLoop = useRef<Animated.CompositeAnimation | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  // Horizontal drift
  useEffect(() => {
    if (reduceMotion) return;
    const a = Animated.loop(Animated.timing(driftA, { toValue: -width, duration: 9000, easing: Easing.linear, useNativeDriver: true }));
    const b = Animated.loop(Animated.timing(driftB, { toValue: -width, duration: 14000, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [width, reduceMotion]);

  // Breathing level
  useEffect(() => {
    breathLoop.current?.stop();
    if (phaseTimer.current) clearInterval(phaseTimer.current);
    if (!running) return;

    const half = breathSeconds * 1000;
    breathLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(level, { toValue: 1, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(level, { toValue: 0, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    breathLoop.current.start();

    let phase: BreathPhase = 'inhale';
    onPhase?.(phase);
    phaseTimer.current = setInterval(() => {
      phase = phase === 'inhale' ? 'exhale' : 'inhale';
      onPhase?.(phase);
    }, half);

    return () => {
      breathLoop.current?.stop();
      if (phaseTimer.current) clearInterval(phaseTimer.current);
    };
  }, [running, breathSeconds]);

  const rise = height * 0.28;
  const translateY = level.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] });

  const pathA = useMemo(() => wavePath(width, 14, height, 0), [width, height]);
  const pathB = useMemo(() => wavePath(width, 22, height, 1), [width, height]);

  return (
    <View style={{ height, overflow: 'hidden' }} pointerEvents="none" accessible={false}>
      <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height, transform: [{ translateY }] }}>
        <Animated.View style={{ position: 'absolute', bottom: 0, width: width * 2, height, transform: [{ translateX: driftB }] }}>
          <Svg width={width * 2} height={height}>
            <Path d={pathB} fill={colors.cyan} opacity={0.18} />
          </Svg>
        </Animated.View>
        <Animated.View style={{ position: 'absolute', bottom: -6, width: width * 2, height, transform: [{ translateX: driftA }] }}>
          <Svg width={width * 2} height={height}>
            <Path d={pathA} fill={colors.indigo} opacity={0.32} />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
