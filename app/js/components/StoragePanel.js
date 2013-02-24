define(["dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
    "dojo/text!./templates/StoragePanel.html", "dojo/_base/lang",
	"dojo/on",
	"dojo/dom-attr",
	"dojo/io-query",
	"components/Utils",
	"components/DateFilterDialog",
	"components/ImportFileDialog"
	],
function(declare, lang, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, template, lang, on, domAttr, ioQuery, 
		utils, 
		DateFilterDialog, 
		ImportFileDialog){

	function initExport(that) {
		var allQuery = "_design/logic/_list/asCsv/byDate?"; 
		domAttr.set(that.exportCsvAll, "href", fintracker.getExpensesUrl()+allQuery);
		domAttr.set(that.exportCsvFiltered, "href", fintracker.getExpensesUrl()+allQuery);
		dojo.subscribe("expensesDateFilter", function(filter) {
			var args = {startkey: '"'+filter.fromMonth+'-01"', 
					endkey: '"'+filter.toMonth+'-31"'};
			domAttr.set(that.exportCsvFiltered, "href", fintracker.getExpensesUrl()+allQuery+dojo.objectToQuery(args));
		});

	}

	function ExpensesEntryArea(expensesService, element) {
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



	function ExpenseEditDialog(expensesService, dialogDijit) {
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

	function initUI(that, ui) {
		ui.createExpenseArea = new ExpensesEntryArea(that._expensesService, that.createExpenseArea);
		ui.recentExpenses = new RecentExpensesTable(that, ui, that._expensesService.createStore(), that.recentExpenses);
//		ui.expensesDateFilterDialog = dijit.byId("dateFilterDialog");
		ui.expensesDateFilterDialog = new DateFilterDialog();
		ui.expensesDateFilterDialog.setLauncher(that.expensesDateFilterLauncher);
		ui.expenseEditDialog = new ExpenseEditDialog(that._expensesService, that.editExpenseDialog);
		ui.importExpensesDialog = that.importExpensesDialog;
		ui.importExpensesDialog.setExpensesService(that._expensesService);
		on(that.importCsv, "click", function(ev) {
			ui.importExpensesDialog.show();
			ev.preventDefault();
		});
		initExport(that);
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



	function RecentExpensesTable(that, ui, couchStore, element) {
		dojo.removeClass(element, "hidden");
//		var couchStore = expensesService.createStore();
		var query = "_design/logic/_view/byDate?"; 
		var queryArgs = {};
		var grid = dojox.grid.EnhancedGrid({store: couchStore,
				query: query, 
	//			queryOptions: {cache: true},//TODO make sorting work
				canSort: function() {return false},
				autoHeight: true, autoWidth: true,
				structure: [
				{name: "Amount", field: "amount"},
				{name: "Date", field: "expDate"},
				{name: "Category", field: "category"},
				{name: "Comment", field: "comment"},
				],
//				plugins: {menus: {rowMenu: "expenseItemMenu"}}
				plugins: {menus: {rowMenu: that.expenseItemMenu}}
				},
		element);
		grid.startup();
		function refreshGrid(expense) {
			grid.setQuery(grid.query); //this seems to be only way to refresh grid without private methods
		}
		dojo.subscribe("insert_expensesStore", refreshGrid);
		dojo.subscribe("remove_expensesStore", refreshGrid);
		dojo.subscribe("update_expensesStore", refreshGrid);

		dojo.subscribe("expensesDateFilter", function(filter) {
			queryArgs.startkey = "\""+filter.fromMonth+"-01\"";
			queryArgs.endkey = "\""+filter.toMonth+"-31\"";
			var fullQuery = query + ioQuery.objectToQuery(queryArgs);
			grid.setQuery(fullQuery); 
		});
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


		that.expenseItemEdit.on("click", editSelectedExpense);
		that.expenseItemDelete.on("click", function() {
			var selItems = grid.selection.getSelected();
			if(confirm("Do you really want to remove following expenses?\n" +
				shortExpenseInfo(selItems).join("\n"))) {
				that._expensesService.remove(selItems).then(function() {
					grid.selection.clear();
				});
			}
		});

		grid.on("rowDblClick", editSelectedExpense); 

		grid.on("rowContextMenu", function(event, a) {
			if(!grid.selection.selected[event.rowIndex]) {
				grid.selection.clickSelect(event.rowIndex, false, false); //select only clicked item if clicked outside of selection
			}
			var selItems = grid.selection.getSelected();
			var multipleSelection = (selItems.length > 1);
			that.expenseItemEdit.set("disabled", multipleSelection);
		});
	}//end RecentExpensesTable constructor




	return declare("components.StoragePanel", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
		templateString: template,

		_ui: {},

		constructor: function(settings) {
			var that = this;
			this._settings = settings;

			this._expensesService = new components.CouchStoreService(settings, "expensesStore");
		}, //end constructor

		postCreate: function() {
			var domNode = this.domNode;
			initUI(this, this._ui);
		}
	})//end declare
});
	
