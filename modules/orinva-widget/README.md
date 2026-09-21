# orinva-widget (Android local module)

Android side of Part 4's home-screen widget. Native code (`android/`) plus
the JS bridge (`index.ts`) and the config plugin (`app.plugin.js`) that
registers the `OrinvaWidgetProvider` receiver in the Android manifest.

## Not currently registered in app.json

This module's `app.plugin.js`, and the `expo-widgets` plugin (iOS side, see
`src/widgets/native/OrinvaWidget.ios.tsx`), are **not** listed in the root
`app.json` `plugins` array. Both require a custom dev client — `expo prebuild`
or an EAS build — and a project that lists them **cannot load in plain Expo
Go at all** (Expo Go rejects any project requiring native modules it doesn't
ship). Since day-to-day testing of this app happens in Expo Go, registering
them there blocks everything, not just the widget.

To test the widget:

```json
"plugins": [
  ...,
  ["expo-widgets", { "widgets": [ /* see git history for the exact ORINVA config */ ] }],
  "./modules/orinva-widget/app.plugin.js"
]
```

then build a dev client (`npx expo run:android` / `npx expo run:ios`, or an
EAS dev build) — never Expo Go — and reinstall it on the device.

The JS side (`src/widgets/widgetData.ts`, `syncWidgets.ts`, `scheduler.ts`)
runs in Expo Go/web/any build regardless — it stays a safe no-op wherever the
native widget isn't compiled in.
