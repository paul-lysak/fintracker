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

return Utils;
});
	
