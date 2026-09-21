package app.orinva.mobile.widget

import android.app.KeyguardManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject

/**
 * Renders ORINVA's Android home-screen widget from the last snapshot the app
 * pushed via OrinvaWidgetModule. Two responsibilities kept deliberately
 * separate from the rest of the app:
 *
 *  1. It never computes anything itself (no duration math, no earnings math)
 *     — that all happens once in JS (widgetData.ts) so the widget can never
 *     drift from what the app itself shows (Part 4 §consistency).
 *  2. It re-checks the lock state on every redraw and falls back to the
 *     generic layout whenever the device is locked and the user hasn't
 *     opted in to sensitive content — even if the last pushed payload was
 *     computed while unlocked. Android removed the iOS-style separate
 *     "Lock Screen widget" surface years ago, so this keyguard check is the
 *     realistic Android equivalent of that privacy gate.
 */
class OrinvaWidgetProvider : AppWidgetProvider() {

  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    for (id in appWidgetIds) render(context, appWidgetManager, id)
  }

  companion object {
    private const val PREFS_NAME = "orinva_widget_prefs"
    private const val KEY_PAYLOAD = "payload"
    private const val CRAVING_HELP_URI = "orinva://craving-help"

    /** Called by OrinvaWidgetModule right after the app computes a fresh snapshot. */
    fun persistAndRefresh(context: Context, payloadJson: String) {
      val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      prefs.edit().putString(KEY_PAYLOAD, payloadJson).apply()

      val manager = AppWidgetManager.getInstance(context)
      val ids = manager.getAppWidgetIds(ComponentName(context, OrinvaWidgetProvider::class.java))
      for (id in ids) render(context, manager, id)
    }

    private fun render(context: Context, manager: AppWidgetManager, widgetId: Int) {
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val raw = prefs.getString(KEY_PAYLOAD, null)
      val payload = try {
        if (raw != null) JSONObject(raw) else null
      } catch (_: Exception) {
        null
      }

      val home = payload?.optJSONObject("home")
      val lock = payload?.optJSONObject("lock")
      val hasFocus = home?.optBoolean("hasFocus", false) ?: false

      val keyguard = context.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
      val isLocked = keyguard?.isKeyguardLocked ?: false
      val sensitiveVisible = lock?.optBoolean("sensitiveVisible", false) ?: false
      val showGeneric = !hasFocus || (isLocked && !sensitiveVisible)

      val views = if (showGeneric) {
        RemoteViews(context.packageName, R.layout.widget_orinva_locked)
      } else {
        RemoteViews(context.packageName, R.layout.widget_orinva).apply {
          setTextViewText(R.id.widget_behavior_name, home?.optString("behaviorName").orEmpty())
          setTextViewText(R.id.widget_clean_label, home?.optString("cleanLabel").orEmpty())
          val savings = home?.optString("savingsLabel")
          if (!savings.isNullOrEmpty() && savings != "null") {
            setTextViewText(R.id.widget_savings_label, "Tahmini biriken: $savings")
            setViewVisibility(R.id.widget_savings_label, View.VISIBLE)
          } else {
            setViewVisibility(R.id.widget_savings_label, View.GONE)
          }
        }
      }

      val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse(CRAVING_HELP_URI))
      val pendingIntent = PendingIntent.getActivity(
        context,
        widgetId,
        openIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

      manager.updateAppWidget(widgetId, views)
    }
  }
}
