require(["dojo/_base/lang",
"dojo/on",
"dojo/topic",
"dojo/behavior",
"dojo/parser",
"dojo/date/locale",
"dojo/store/Memory",
"dojo/data/ObjectStore",
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
"dojo/domReady!"],
function(lang, on, topic, behavior, parser) {
dojo.parser.parse();

window.fintracker = fintracker = {
	settings: {
		storage: {type: "couchdb",
		url: "http://localhost:8080/couchdb/",
		expensesStore: "fintracker_expenses",
		statusStore: "fintracker_status"
		}
	},
	getExpensesUrl: function() {
		return this.settings.storage.url+this.settings.storage.expensesStore+"/";
	},
	categories: {
		other: "Uncategorized",
		food: "Food and drink",
		car: "Car (fuel, repair, etc.)",
		household: "Household (payments, repairs, etc.)",
	}
}

var utils = components.Utils;
var dbInit = new components.DbInit(fintracker.settings);

dbInit.ensureDbExists().then(
	function(succ) {
		initUI();
	},
	function(err) {
		alert("Failed to create DB", err);
	});


function displayInfo(msg) {
	dojo.publish("toasterMessageTopic", {message: msg, type: "info", duration: 1000});
}

function displayError(msg) {
	dojo.publish("toasterMessageTopic", {message: msg, type: "error", duration: 3000});
}

var expensesService = new components.CouchStoreService(fintracker.settings, "expensesStore");

var ui = {};
function initUI() {
	ui.createExpenseArea = new ExpensesEntryArea(dojo.byId("createExpenseArea"));
	ui.recentExpenses = new RecentExpensesTable(dojo.byId("recentExpenses"));
	ui.expensesDateFilter = new DateFilter(dijit.byId("expensesDateFilterDialog"), 
		dojo.byId("expensesDateFilter"));
	ui.expenseEditDialog = new ExpenseEditDialog(dijit.byId("editExpenseDialog"));
}

function ExpensesEntryArea(element) {
	dojo.removeClass(element, "hidden");
	var form = utils.getSubWidget(element, ".createExpenseForm");
	form.set("categoriesMap", fintracker.categories);
	form.expDate.set("value", new Date());
	dojo.query("[name=ok]", element).connect("click", 
		function(){
			if(!form.validate()) {
				displayError("Please enter valid data");
				return;
			}
			var expense = form.get("expense"); 
			expensesService.insert(expense).then(function(res) {
				//reset all fields except of date
				form.amount.reset();
				form.category.reset();
				form.comment.reset();
				displayInfo("Expense added");
			}, function() {displayError("Failed to add expense.");});
		});
}

function DateFilter(dialogDijit, starter) {
	var closeButton = utils.getSubWidget(dialogDijit, "[name='close']");
	function generateMonthTree(yearsCount) {
		var dates = [];
		var nowYear = (new Date()).getFullYear();
		var nowMonth = (new Date()).getMonth()+1; 
		function generateMonthArray(year, lastMonth) {
			var monthArray = [];
			for(var month=1; month<=lastMonth; month++) {
				var monthStr = month<10?"0"+month:month;
				var monthName = dojo.date.locale.getNames("months", "wide")[month];
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

function ExpenseEditDialog(dialogDijit) {
	var expenseForm = utils.getSubWidget(dialogDijit, "form.expenseForm");
	expenseForm.set("categoriesMap", fintracker.categories);
	var okButton = utils.getSubWidget(dialogDijit, "[name='ok']");
	var cancelButton = utils.getSubWidget(dialogDijit, "[name='cancel']");
	okButton.on("click", function() {
		if(!expenseForm.isValid()) {
				displayError("Please enter valid data");
				return;
			}
		var updatedExpense = expenseForm.get("expense"); 
		expensesService.update(updatedExpense).then(
			function() {displayInfo("Expense updated");}, 
			function() {displayError("Failed to update expense.");});
		dialogDijit.hide();
		});
	cancelButton.on("click", function() {
		dialogDijit.reset();
		dialogDijit.hide();
		});

	this.edit = function(expense) {
		expenseForm.set("expense", expense);
		expenseForm.set("somestuff", expense);
		dialogDijit.show();
	}
}

function shortExpenseInfo(expenseItems, maxItems, maxDescr) {
	if(maxItems === undefined)
		maxItems = 5;
	if(maxDescr === undefined)
		maxDescr = 32;
	var res = [];	
	var n = Math.min(maxItems, expenseItems.length);
	var remains = expenseItems.length - n;
	for(var i = 0; i<n; i++) {
		var descr = expenseItems[i].comment;
		if(descr != null && descr.length > maxDescr) {
			descr = descr.substring(0, maxDescr-3)+"...";
		}
		res[i] = expenseItems[i].amount + " " + expenseItems[i].expDate+" "+descr;
	}
	if(remains > 0 ) {
		res.push("and "+remains+" items more");
	}
	return res;
}

function RecentExpensesTable(element) {
	dojo.removeClass(element, "hidden");
	var couchStore = new dojox.data.CouchDBRestStore({
		target: fintracker.getExpensesUrl()});;
 	var grid = dojox.grid.EnhancedGrid({store: couchStore,
			query: "_design/logic/_view/byDate?",
//			queryOptions: {cache: true},//TODO make sorting work
			canSort: function() {return false},
			autoHeight: true, autoWidth: true,
			structure: [
			{name: "Amount", field: "amount"},
			{name: "Date", field: "expDate"},
			{name: "Category", field: "category"},
			{name: "Comment", field: "comment"},
			],
			plugins: {menus: {rowMenu: "expenseItemMenu"}}
			},
	element);
	grid.startup();
	function refreshGrid(expense) {
		grid.setQuery(grid.query); //this seems to be only way to refresh grid without private methods
	}
	dojo.subscribe("insert_expensesStore", refreshGrid);
	dojo.subscribe("remove_expensesStore", refreshGrid);
	dojo.subscribe("update_expensesStore", refreshGrid);

	/**
	* Strip down some garbage after JsonRestStore
	*/	
	function getPlainObject(heavyObject) {
		var plainObject = {};
		dojo.mixin(plainObject, heavyObject);
		delete plainObject.__id;
		delete plainObject.__parent;
		delete plainObject._loadObject;
		for(var k in plainObject) {
			if(dojo.isObject(plainObject[k])) {
				plainObject[k] = dojo.clone(plainObject[k]);
			}
		}
		return plainObject;
	}

	function editSelectedExpense() {
		if(grid.selection.getSelected().length > 1) {
			return;//TODO don't allow this method to be called when multiple items selected
		}
		var selItem = grid.selection.getSelected()[0];
		ui.expenseEditDialog.edit(getPlainObject(selItem));
	}

	dojo.behavior.add(
		{"#expenseItemMenu .edit": {
			onclick: editSelectedExpense 
		},
		"#expenseItemMenu .delete": {
			onclick: function() {
				var selItems = grid.selection.getSelected();
				if(confirm("Do you really want to remove following expenses?\n" +
					shortExpenseInfo(selItems).join("\n"))) {
					expensesService.remove(selItems).then(function() {
						grid.selection.clear();
					});
				}
		}}
	});
	dojo.behavior.apply();
	
	grid.on("rowDblClick", editSelectedExpense); 
	var menuItemEdit = dijit.getEnclosingWidget(dojo.query("#expenseItemMenu .edit")[0]);
	var menuItemDelete = dijit.getEnclosingWidget(dojo.query("#expenseItemMenu .delete")[0]);
	grid.on("rowContextMenu", function(event, a) {
		if(!grid.selection.selected[event.rowIndex]) {
			grid.selection.clickSelect(event.rowIndex, false, false); //select only clicked item if clicked outside of selection
		}
		var selItems = grid.selection.getSelected();
		var multipleSelection = (selItems.length > 1);
		menuItemEdit.set("disabled", multipleSelection);
	});
}

})
