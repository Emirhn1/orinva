package app.orinva.mobile.widget

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * JS-callable bridge for the Android home-screen widget. Deliberately tiny:
 * it only persists the latest snapshot and asks the OS to redraw — all the
 * "what to show" logic already happened on the JS side (src/widgets/widgetData.ts),
 * including the lock-screen privacy gate (§Part 4). This module never
 * re-derives or second-guesses that decision.
 */
class OrinvaWidgetModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("OrinvaWidget")

    Function("updateWidgetData") { payloadJson: String ->
      OrinvaWidgetProvider.persistAndRefresh(appContext.reactContext ?: return@Function, payloadJson)
    }
  }
}
