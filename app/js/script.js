require([
"config/FintrackerConfig",
"dojo/_base/lang",
"dojo/on",
"dojo/topic",
"dojo/behavior",
"dojo/parser",
"dojo/io-query",
"dojo/window",
"dojo/dom-style",
"dojo/dom-attr",
"dojo/date/locale",
"dojo/store/Memory",
"dojo/data/ObjectStore",
"dijit/layout/BorderContainer",
"dijit/layout/TabContainer",
"dijit/layout/ContentPane",
"dijit/Dialog",
"dijit/Menu",
"dijit/Tree",
"dojox/data/ClientFilter",
"dojox/data/CouchDBRestStore",
"dojox/grid/EnhancedGrid",
"dojox/grid/enhanced/plugins/Menu",
"dojox/widget/Toaster",
"components/Utils",
"components/ExpenseForm",
"components/DbInit",
"components/CouchStoreService",
"components/LoginController",
//"components/StoragePanel",
"dojo/domReady!"],
function(fintrackerConfig, lang, on, topic, behavior, parser, ioQuery, winUtils, domStyle, domAttr) {
dojo.parser.parse();

window.fintracker = fintracker = lang.delegate(fintrackerConfig, {
	getExpensesUrl: function() {
		return this.settings.storage.url+this.settings.storage.expensesStore+"/";
	}
});

var utils = components.Utils;
var loginController = new components.LoginController(fintracker.settings);
var dbInit = new components.DbInit(fintracker.settings, loginController);

dbInit.ensureDbExists().then(
	function(succ) {
		initTabsContent();
//		initUI();
	},
	function(err) {
		alert("Failed to create or verify DB\n"+err);
	});


function displayInfo(msg) {
	dojo.publish("toasterMessageTopic", {message: msg, type: "info", duration: 1000});
}

function displayError(msg) {
	dojo.publish("toasterMessageTopic", {message: msg, type: "error", duration: 3000});
}

/**
* Load current tab content and set up a handler that loads selected tab content
*/ 
function initTabsContent() {
	var tabs = dijit.byId("appSectionsPanel");	
	loadTab(tabs.selectedChildWidget);
	tabs.watch("selectedChildWidget", function(name, fromTab, toTab) {
		loadTab(toTab);
	});
	function loadTab(tab) {
		console.log("load", tab);	
		require(["components/StoragePanel"], function(TabModule) {
			console.log("loaded", TabModule);	
			var tabContentWidget = new TabModule(fintracker.settings); 
			tab.set("content", tabContentWidget);
		})
	}
}
});

