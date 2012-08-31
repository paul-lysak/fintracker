define(["dojo/_base/declare",
"dojo/on",
"dojo/topic",
"dojo/window",
"dojo/dom-style",
"components/Utils",
"dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
"dojo/text!./templates/DateFilterDialog.html" 
], 
function(declare, on, topic, winUtils, domStyle, utils, 
WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, dialogTemplate ) {
	function generateMonthTree(yearsCount) {
		var dates = [];
		var nowYear = (new Date()).getFullYear();
		var nowMonth = (new Date()).getMonth()+1; 
		function generateMonthArray(year, lastMonth) {
			var monthArray = [];
			for(var month=1; month<=lastMonth; month++) {
				var monthStr = month<10?"0"+month:month;
				var monthName = dojo.date.locale.getNames("months", "wide")[month-1];
				monthArray.push({id: year+"-"+monthStr, label: monthName});
			}
			return monthArray;
		}
		for(var year=nowYear-yearsCount+1;year<nowYear;year++) {
			dates.push({id: year+"", label: year, children: generateMonthArray(year, 12)});
		}
		dates.push({id: year, label: year, children: generateMonthArray(year, nowMonth)});
		return dates;
	}

var launcher = null;

return declare("components.DateFilterDialog", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
	templateString: dialogTemplate,

	postCreate: function() {
		var that = this;
		var closeButton = this.closeButton;

		var dates = generateMonthTree(5);
		var mStore = new dojo.store.Memory({data: dates});
		var model = new dijit.tree.ForestStoreModel({
			store: new dojo.data.ObjectStore({objectStore: mStore})
		});
		var tree = new dijit.Tree({
			model: model,
			showRoot: false
		}, this.dateTree);
		tree.startup();
		closeButton.on("click", function() {
			that.dialogDijit.hide();
			});
		topic.subscribe(tree.id, function(msg) {
			var month = tree.get("selectedItems");
			month = dojo.map(month, function(item) {return item.id});
			var fromMonth = null;
			var toMonth = null;
			for(var i=0; i<month.length; i++) {
				if(fromMonth == null || fromMonth > month[i]) 
					fromMonth = month[i];
				if(toMonth == null || toMonth < month[i])
					toMonth = month[i];
			}
			if(fromMonth.length != null && fromMonth.length == 4)
				fromMonth = fromMonth + "-01";
			if(toMonth.length != null && toMonth.length == 4)
				toMonth = toMonth + "-12";
			if(fromMonth == null) {
				launcher.innerHTML = "none";
			} else if(fromMonth == toMonth) {
				launcher.innerHTML = fromMonth;
			} else {
				launcher.innerHTML = "from "+fromMonth+" to "+toMonth;
			}
			//TODO configurable topic id
			dojo.publish("expensesDateFilter", {"fromMonth": fromMonth, "toMonth": toMonth}); 
		});
	},


	setLauncher: function(_launcher) {
		var that = this;
		launcher = _launcher;
		on(launcher, "click", function(ev) {
			var viewport = winUtils.getBox();
			domStyle.set(that.dialogContent, {height: viewport.h*0.75+"px"});
			that.dialogDijit.show();
		});
	}

});
});
