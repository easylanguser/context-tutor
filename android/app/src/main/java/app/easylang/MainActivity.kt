package app.easylang

import android.os.Bundle

import com.getcapacitor.BridgeActivity
import com.getcapacitor.Plugin

import java.util.ArrayList

class MainActivity : BridgeActivity() {
    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initializes the Bridge
        this.init(savedInstanceState, object : ArrayList<Class<out Plugin>>() {
            init { }
        })
    }
}
