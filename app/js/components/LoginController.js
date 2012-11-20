define(["dojo/_base/declare", 
	"components/LoginDialog"], 
function(declare, LoginDialog) {
	return declare("components.LoginController", [], {
		constructor: function(settings) {
			this._settings = settings;
		},

		getDialog: function() {
			if (!this._dialog) {
				this._dialog = new components.LoginDialog();
			}
			return this._dialog;
		},

		_sendAuthenticationRequest: function(login, password) {
			var def = new dojo.Deferred();
			dojo.xhrPost({url: this._settings.storage.url+"_session", 
				content: {name: login, password: password},
				load: function() {
					def.resolve();
				},
				error: function(error, ioargs) {
					try {
						var msg = dojo.fromJson(ioargs.xhr.response).reason;
					} catch(e) {
						msg = error.message;
					}
					if(!msg) msg = error.message
					def.reject(msg);
				}});
			return def;
		},

		logIn: function() {
			return this.getDialog().logIn(dojo.hitch(this, this._sendAuthenticationRequest));
		}
	});
});
