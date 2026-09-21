/**
 * Non-iOS fallback. Metro's platform-extension resolution picks
 * `OrinvaWidget.ios.tsx` (the real @expo/ui/expo-widgets widget) on iOS and
 * this file everywhere else — keeping the iOS-only SwiftUI widget code
 * (and the expo-widgets/@expo/ui packages it pulls in) out of the
 * Android/web bundles entirely, rather than just skipping it at runtime.
 */
export default null;
