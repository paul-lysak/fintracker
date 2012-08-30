define(["dojo/_base/declare",
"dojo/on",
"dojo/topic",
"dojo/window",
"dojo/dom-style",
"components/Utils" ], 
function(declare, on, topic, winUtils, domStyle, utils) {
var DateFilter = declare("components.DateFilter", null, {
	constructor: function(dialogDijit, starter) {
		var closeButton = utils.getSubWidget(dialogDijit, "[name='close']");
		var dialogContent = dojo.query(".dialogContent", dialogDijit.domNode)[0];
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
		var dates = generateMonthTree(5);
		var mStore = new dojo.store.Memory({data: dates});
		var model = new dijit.tree.ForestStoreModel({
			store: new dojo.data.ObjectStore({objectStore: mStore})
		});
		var tree = new dijit.Tree({
			model: model,
			showRoot: false
		}, "expensesDateTree");
		tree.startup();
		closeButton.on("click", function() {
			dialogDijit.hide();
			});
		on(starter, "click", function(ev) {
			var viewport = winUtils.getBox();
			domStyle.set(dialogContent, {height: viewport.h*0.75+"px"});
			dialogDijit.show();
		});
		topic.subscribe("expensesDateTree", function(msg) {
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
				starter.innerHTML = "none";
			} else if(fromMonth == toMonth) {
				starter.innerHTML = fromMonth;
			} else {
				starter.innerHTML = "from "+fromMonth+" to "+toMonth;
			}
			dojo.publish("expensesDateFilter", {"fromMonth": fromMonth, "toMonth": toMonth}); 
		});
	}
});
return DateFilter;
});
