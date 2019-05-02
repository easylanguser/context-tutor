var exec = require('cordova/exec');
var PLUGIN_NAME = 'ReceiveContent';

module.exports = {
    /**
     * Receive text
     */
    receiveText: function() {
        return new Promise(function(resolve, reject) {
            exec (resolve, reject, PLUGIN_NAME, "receiveText", []);
        })
    }
};
