define(["dojo/_base/declare"], 
function(declare) {
var Utils = declare("components.Utils", null, {
});

Utils.getSubWidget = function(widgetOrNode, query) {
		var node = widgetOrNode.domNode;
		if(node == undefined) {
			node = widgetOrNode;
		}
		var subWidget = dijit.getEnclosingWidget(dojo.query(query, node)[0]);
		return subWidget;
	}	

Utils.min = function(a, b) {
		return a<b?a:b;
	}

Utils.max = function(a, b) {
		return a>b?a:b;
	}
	
Utils.joinDef = function(inDef, outDef) {
	inDef.then(function (arg) {
			outDef.resolve(arg);
		},
		function (arg) {
			outDef.reject(arg);
		});
}

return Utils;
});
	
