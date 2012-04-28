dojo.require("dojo.fx");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Select");
dojo.require("dojox.validate");
dojo.require("dojox.validate.web");
dojo.require("dojox.data.ClientFilter");
dojo.require("dojox.data.CouchDBRestStore");
dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.NumberTextBox");
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
						def.resolve(put_res);},
					function(put_err) {
						console.log("expense add fail", put_err);
						def.reject(put_err);}
				);
		}, function(uuid_err) {
			def.reject(uuid_err);
		});
		return def;
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

function ExpensesEntryForm(element) {
	dojo.removeClass(element, "hidden");
//	var form = dojo.query("form", element);
	var form = dijit.byNode(element);
	var catSelect = dijit.byId("expenseCategory");
	for(var optName in fintracker.categories) {
		catSelect.addOption({value: optName, 
			label: fintracker.categories[optName]});
	}
	dojo.query(".submit", element).connect("click", 
		function(){
//			var expense = dojo.formToObject(form); 
			if(!form.validate()) {
				alert("Please enter valid data");
				return;
			}
			var expense = dojo.formToObject("expensesEntry"); 
			expensesService.addExpense(expense).then(function(res) {
				console.log("exp callback", res);
			});
		});
	console.log("form", catSelect, form);
}

function RecentExpensesTable(element) {
	dojo.removeClass(element, "hidden");
	var couchStore = new dojox.data.CouchDBRestStore({
		target: fintracker.getExpensesUrl()});
 	var grid = dojox.grid.DataGrid({store: couchStore,
			query: "_design/logic/_view/byDate?",
//			queryOptions: {cache: true},//TODO make sorting work
			canSort: function() {return false},
			autoHeight: true, autoWidth: true,
			structure: [
			{name: "Amount", field: "amount"},
			{name: "Date", field: "expDate"},
			{name: "Category", field: "category"},
			{name: "Comment", field: "comment"},
			]
			},
	element);
	grid.startup();
}

})
