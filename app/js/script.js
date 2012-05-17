dojo.require("dojo._base.lang");
dojo.require("dojo.fx");
dojo.require("dojo.topic");
dojo.require("dojo.behavior");
dojo.require("dijit.Dialog");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Select");
dojo.require("dojox.validate");
dojo.require("dojox.validate.web");
dojo.require("dojox.data.ClientFilter");
dojo.require("dojox.data.CouchDBRestStore");
dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.grid.enhanced.plugins.Menu");
dojo.require("dojox.widget.Toaster");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.NumberTextBox");
dojo.require("components.ExpenseForm");
dojo.ready(function() {
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
var dbInit = new DbInit(fintracker.settings);

function displayInfo(msg) {
	dojo.publish("toasterMessageTopic", {message: msg, type: "info", duration: 1000});
}

var expensesService = new function() {
	//returns deferred with promise containing uuid string
	function askUuid() {
		var def = dojo.xhrGet({
			url: fintracker.settings.storage.url+"_uuids",
			handleAs: "json"});
		def = def.then(function(uuidsObj){
				return uuidsObj.uuids[0];
				});
		return def;
	}

	var expensesStore = dojox.rpc.Rest(fintracker.getExpensesUrl(), true);
	this.addExpense = function(expense) {
		console.log("add expense", expense);
		var def = new dojo.Deferred();
		askUuid().then(function(uuid) {
				console.log("got uuid", uuid)
				var p = expensesStore.put(uuid, dojo.toJson(expense)).
			then(function(put_res) {
						console.log("expense add success", put_res);
						def.resolve(put_res);
						dojo.publish("addExpense", expense);
						},
					function(put_err) {
						console.log("expense add fail", put_err);
						def.reject(put_err);}
				);
		}, function(uuid_err) {
			def.reject(uuid_err);
		});
		return def;
	}

	this.removeExpenses = function(expenses) {
		var def;
		if(expenses.length == 1) {
			var item = expenses[0];
			def = expensesStore.delete(item._id+"?rev="+item._rev);	
		} else {
			var bulkBody = {docs: []};
			expenses.forEach(function(item) {
				bulkBody.docs.push({_id: item._id, _rev: item._rev, _deleted: true});
			});
			def = expensesStore.post("_bulk_docs", dojo.toJson(bulkBody));
		}
		return def.then(function() {
			dojo.publish("removeExpenses", expenses);
		});
	}

	this.updateExpense = function(expense) {
		console.log("updateExpense", expense);
		return expensesStore.put(expense._id, dojo.toJson(expense)).then(
			function() {
				dojo.publish("updateExpense", expense);
			});
	}
};

dbInit.ensureDbExists().then(
	function(succ) {
		initUI();
	},
	function(err) {
		alert("Failed to create DB", err);
	});

function initUI() {
	var expEntry = new ExpensesEntryForm(dojo.byId("expensesEntry"));
	var recentExpenses = new RecentExpensesTable(dojo.byId("recentExpenses"));
}
var expenseEditDialog = new ExpenseEditDialog(dijit.byId("editExpenseDialog"));

function ExpensesEntryForm(element) {
//TODO use ExpenseForm widget here
	dojo.removeClass(element, "hidden");
//	var form = dojo.query("form", element);
	var form = dijit.byNode(element);
	var controls = {
		amount: dijit.getEnclosingWidget(dojo.query("[name=amount]", element)[0]),
		expDate: dijit.getEnclosingWidget(dojo.query("[name=expDate]", element)[0]),
		category: dijit.getEnclosingWidget(dojo.query("[name=category]", element)[0]),
		comment: dijit.getEnclosingWidget(dojo.query("[name=comment]", element)[0])
	}
	controls.expDate.set("value", new Date());
	for(var optName in fintracker.categories) {
		controls.category.addOption({value: optName, 
			label: fintracker.categories[optName]});
	}
	dojo.query(".submit", element).connect("click", 
		function(){
			if(!form.validate()) {
				alert("Please enter valid data");
				return;
			}
			var expense = dojo.formToObject("expensesEntry"); 
			expensesService.addExpense(expense).then(function(res) {
				//reset all fields except of date
				controls.amount.reset();
				controls.category.reset();
				controls.comment.reset();
				displayInfo("Expense added");
			});
		});
}

function getSubWidget(widget, query) {
	var subWidget = dijit.getEnclosingWidget(dojo.query(query, widget.domNode)[0]);
	return subWidget;
}

function ExpenseEditDialog(dialogDijit) {
	var expenseForm = getSubWidget(dialogDijit, "form.expenseForm");
	expenseForm.set("categoriesMap", fintracker.categories);
	var okButton = getSubWidget(dialogDijit, "[name='ok']");
	var cancelButton = getSubWidget(dialogDijit, "[name='cancel']");
	okButton.on("click", function() {
		if(!expenseForm.isValid()) {
				alert("Please enter valid data");
				return;
			}
		var updatedExpense = expenseForm.get("expense"); 
		expensesService.updateExpense(updatedExpense).then(
			function() {
				displayInfo("Expense updated");
			});
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
	dojo.subscribe("addExpense", refreshGrid);
	dojo.subscribe("updateExpense", refreshGrid);
	dojo.subscribe("removeExpenses", refreshGrid);

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
		var selItem = grid.selection.getSelected()[0];
		expenseEditDialog.edit(getPlainObject(selItem));
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
					expensesService.removeExpenses(selItems);
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
		if(selItems.length > 1) {
			menuItemEdit.attr("disabled", true);
		} else {
			menuItemEdit.attr("disabled", false);
		}
	});
}

})
