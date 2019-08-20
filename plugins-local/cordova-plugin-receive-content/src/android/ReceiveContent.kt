package receiveContent

import android.content.Intent
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONException

/**
 * This class echoes a string called from JavaScript.
 */
class ReceiveContent : CordovaPlugin() {

    @Throws(JSONException::class)
    override fun execute(action: String, args: JSONArray, callbackContext: CallbackContext): Boolean {
        if (action == "receiveText") {
            this.getTextFromIntent(callbackContext)
            return true
        }
        return false
    }

    private fun getTextFromIntent(context: CallbackContext) {
        var receiveText = ""
        val intent = cordova.activity.intent
        val action = intent.action
        val type = intent.type
        if (Intent.ACTION_SEND == action && type != null) {
            if (type == "text/plain") {
                val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
                if (sharedText != null) {
                    receiveText = sharedText
                }
            }
        }
        context.sendPluginResult(PluginResult(PluginResult.Status.OK, receiveText))
    }
}