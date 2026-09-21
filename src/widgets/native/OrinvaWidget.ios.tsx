import { HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, lineLimit, padding, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { WidgetPushPayload } from '../syncWidgets';

/**
 * ORINVA's one iOS widget definition, covering both the home screen
 * (systemSmall/systemMedium) and the Lock Screen (accessory* families) —
 * Part 4 requires both surfaces but with very different privacy rules, so a
 * single component switches behavior on `environment.widgetFamily` instead
 * of duplicating the shared layout plumbing across two widget kinds.
 *
 * Everything here is static text set from `props`, computed once on the JS
 * side (see widgetData.ts) and pushed in with updateSnapshot — never a
 * live-ticking counter (`Text timerInterval`), per the "don't design the
 * widget like a live seconds counter" requirement in the plan.
 *
 * The whole widget opens straight into "Zor An" (craving-help) on tap via
 * `widgetURL` — that direct action is the other half of the requirement.
 */
const OrinvaWidgetComponent = (props: WidgetPushPayload, environment: WidgetEnvironment) => {
  'widget';

  const CRAVING_HELP_URL = 'orinva://craving-help';
  const isLockScreen =
    environment.widgetFamily === 'accessoryRectangular' ||
    environment.widgetFamily === 'accessoryCircular' ||
    environment.widgetFamily === 'accessoryInline';

  if (isLockScreen) {
    const lock = props.lock;
    if (!lock.sensitiveVisible || !lock.hasFocus) {
      // Default, privacy-safe state: no behavior name, no slip info, no progress — just a neutral mark.
      return (
        <VStack modifiers={[widgetURL(CRAVING_HELP_URL)]}>
          <Image systemName="wind" />
          {environment.widgetFamily !== 'accessoryCircular' ? <Text>ORINVA</Text> : null}
        </VStack>
      );
    }
    return (
      <VStack alignment="leading" modifiers={[widgetURL(CRAVING_HELP_URL)]}>
        <Text modifiers={[font({ weight: 'semibold', size: 13 })]}>{lock.behaviorName ?? 'ORINVA'}</Text>
        {lock.cleanLabel ? <Text modifiers={[font({ size: 12 })]}>{lock.cleanLabel}</Text> : null}
      </VStack>
    );
  }

  const home = props.home;

  if (!home.hasFocus) {
    return (
      <VStack alignment="leading" spacing={4} modifiers={[padding({ all: 12 }), widgetURL(CRAVING_HELP_URL)]}>
        <Text modifiers={[font({ weight: 'bold', size: 15 })]}>ORINVA</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle('secondary')]}>Bir davranış ekleyerek başla</Text>
      </VStack>
    );
  }

  if (environment.widgetFamily === 'systemSmall') {
    return (
      <VStack alignment="leading" spacing={4} modifiers={[padding({ all: 12 }), widgetURL(CRAVING_HELP_URL)]}>
        <Text modifiers={[font({ size: 11 }), foregroundStyle('secondary'), lineLimit(1)]}>
          {home.behaviorName}
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 20 })]}>{home.cleanLabel}</Text>
        {home.savingsLabel ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle('secondary')]}>{home.savingsLabel}</Text>
        ) : null}
        <Text modifiers={[font({ size: 11 }), foregroundStyle('#4E5FB8')]}>Zor an →</Text>
      </VStack>
    );
  }

  // systemMedium and any other family: same content, laid out with more room.
  return (
    <HStack modifiers={[padding({ all: 14 }), widgetURL(CRAVING_HELP_URL)]}>
      <VStack alignment="leading" spacing={4}>
        <Text modifiers={[font({ size: 12 }), foregroundStyle('secondary'), lineLimit(1)]}>
          {home.behaviorName}
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 22 })]}>{home.cleanLabel}</Text>
        {home.savingsLabel ? (
          <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
            Tahmini biriken: {home.savingsLabel}
            {home.goalLabel && home.goalProgressPct !== null ? ` · ${home.goalLabel} %${home.goalProgressPct}` : ''}
          </Text>
        ) : null}
      </VStack>
      <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle('#4E5FB8')]}>Zor an</Text>
    </HStack>
  );
};

const OrinvaWidget = createWidget<WidgetPushPayload>('OrinvaWidget', OrinvaWidgetComponent);

export default OrinvaWidget;
