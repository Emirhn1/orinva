import { Platform } from 'react-native';

interface OrinvaWidgetNativeModule {
  /** Pushes a JSON-encoded WidgetPushPayload (see src/widgets/syncWidgets.ts) to the Android widget and asks the OS to redraw it. */
  updateWidgetData(payloadJson: string): void;
}

let native: OrinvaWidgetNativeModule | null = null;

if (Platform.OS === 'android') {
  try {
    // Lazy require: this module only exists in a custom dev/production build with
    // the Android widget compiled in, never in Expo Go or on iOS/web.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { requireNativeModule } = require('expo-modules-core');
    native = requireNativeModule('OrinvaWidget') as OrinvaWidgetNativeModule;
  } catch {
    native = null;
  }
}

/** Safe no-op on any platform/build that doesn't have the native widget module compiled in. */
export function updateWidgetData(payloadJson: string): void {
  native?.updateWidgetData(payloadJson);
}
