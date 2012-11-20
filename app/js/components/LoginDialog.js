define(["dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/keys",
	"dojo/on",
	"dijit/focus",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
	"dojo/text!./templates/LoginDialog.html",
	"components/Utils",
	],
function(declare, array, lang, keys, on, focusUtil, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, dialogTemplate, utils) {

	return declare("components.LoginDialog", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], 
	{
		templateString: dialogTemplate,

		constructor: function() {
		},

		postCreate: function() {
			var that = this;
			function clearContext() {
				that._loginDeferred = null;
				that._loginFunction = null;
				that.messagePlace.innerHTML = "";
				that.dialogDijit.hide();
			};

			function sendRequest() {
				that._loginFunction(that.login.get("value"), that.password.get("value")).then(function() {
					that._loginDeferred.resolve();
					clearContext();
				}, 
				function(errMsg) {
					that.messagePlace.innerHTML = errMsg;
				});
			}

			this.login.on("keydown", function(ev) {
				if(ev.keyCode == keys.ENTER)
					focusUtil.focus(that.password);	
			});

			this.password.on("keydown", function(ev) {
				if(ev.keyCode == keys.ENTER)
					sendRequest();
			});


			this.cancelButton.on("click", function(ev) {
				that._loginDeferred.reject();
				clearContext();
			});

			this.okButton.on("click", sendRequest);
		},

		logIn: function(loginFunction) {
			this._loginFunction = loginFunction;
			if(this._loginDeferred) {
				this._loginDeferred.reject();
			}
			this._loginDeferred = new dojo.Deferred();
			this.dialogDijit.show();	
			return this._loginDeferred;
		},

	});
});
