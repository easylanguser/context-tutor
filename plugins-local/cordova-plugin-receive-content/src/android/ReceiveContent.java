package receiveContent;
import android.content.Intent;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * This class echoes a string called from JavaScript.
 */
public class ReceiveContent extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("receiveText")) {
            this.getTextFromIntent(callbackContext);
            return true;
        }
        return false;
    }

    private void getTextFromIntent (final CallbackContext context) {
        String receiveText = "";
        Intent intent = cordova.getActivity().getIntent();
        String action = intent.getAction();
        String type = intent.getType();
        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if ("text/plain".equals(type)) {
                String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (sharedText != null) {
                    receiveText = sharedText;
                }
            }
        }
        context.sendPluginResult(new PluginResult(PluginResult.Status.OK, receiveText));
    }
}



