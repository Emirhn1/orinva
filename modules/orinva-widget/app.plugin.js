const { withAndroidManifest } = require('expo/config-plugins');

const RECEIVER_NAME = 'app.orinva.mobile.widget.OrinvaWidgetProvider';

/**
 * Registers the OrinvaWidgetProvider <receiver> in the Android app manifest.
 * Expo's module autolinking wires up the JS-callable native module
 * (OrinvaWidgetModule) automatically, but an AppWidgetProvider is a manifest
 * component, not a native module — it has to be declared explicitly, which
 * is the one thing this plugin exists to do.
 */
const withOrinvaWidget = (config) =>
  withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) return config;

    app.receiver = app.receiver ?? [];
    const alreadyRegistered = app.receiver.some((r) => r.$?.['android:name'] === RECEIVER_NAME);
    if (alreadyRegistered) return config;

    app.receiver.push({
      $: {
        'android:name': RECEIVER_NAME,
        'android:exported': 'false',
        'android:label': '@string/orinva_widget_description',
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }],
        },
      ],
      'meta-data': [
        {
          $: {
            'android:name': 'android.appwidget.provider',
            'android:resource': '@xml/orinva_widget_info',
          },
        },
      ],
    });

    return config;
  });

module.exports = withOrinvaWidget;
