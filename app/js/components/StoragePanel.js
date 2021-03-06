define(["dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
	"dojo/Evented",
    "dojo/text!./templates/StoragePanel.html", "dojo/_base/lang",
	"dojo/on",
	"dojo/dom-attr",
	"dojo/io-query",
	"components/Utils",
	"components/DateFilterDialog",
	"components/ImportFileDialog"
	],
function(declare, lang, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, 
		Evented,
		template, lang, on, domAttr, ioQuery, 
		utils, 
		DateFilterDialog, 
		ImportFileDialog){

	function initExport(that) {
		var allQuery = "_design/logic/_list/asCsv/byDate?"; 
		var storeUrl = that._storageService.storeURL;
		domAttr.set(that.exportCsvAll, "href", storeUrl+allQuery);
		domAttr.set(that.exportCsvFiltered, "href", fintracker.getExpensesUrl()+allQuery);
		on(that, "ft:filterChange", function(filter) {
			var args = {startkey: '"'+filter.fromMonth+'-01"', 
					endkey: '"'+filter.toMonth+'-31"'};
			domAttr.set(that.exportCsvFiltered, "href", storeUrl+allQuery+dojo.objectToQuery(args));
		});

	}

	function ItemEntryArea(storageService, element) {
		dojo.removeClass(element, "hidden");
		var form = utils.getSubWidget(element, ".itemForm");
		form.initInput();
		dojo.query("[name=ok]", element).connect("click", 
			function(){
				if(!form.validate()) {
					displayError("Please enter valid data");
					return;
				}
				var item = form.get("item"); 
				storageService.insert(item).then(function(res) {
					//reset all fields except of date
					form.clearAfterInput();
					displayInfo("Item added");
				}, function() {displayError("Failed to add item");});
			});
	}



	function ItemEditDialog(storageService, dialogDijit) {
		var itemForm = utils.getSubWidget(dialogDijit, "form.itemForm");
		itemForm.initInput();
		var okButton = utils.getSubWidget(dialogDijit, "[name='ok']");
		var cancelButton = utils.getSubWidget(dialogDijit, "[name='cancel']");
		okButton.on("click", function() {
			if(!itemForm.isValid()) {
					displayError("Please enter valid data");
					return;
				}
			var updatedItem = itemForm.get("item"); 
			storageService.update(updatedItem).then(
				function() {displayInfo("Item updated");}, 
				function() {displayError("Failed to update item");});
			dialogDijit.hide();
			});
		cancelButton.on("click", function() {
			dialogDijit.reset();
			dialogDijit.hide();
			});

		this.edit = function(formItem) {
			itemForm.set("item", formItem);
			dialogDijit.show();
		}
	}

	function initUI(that, ui) {
		(new that._ItemFormComponent()).placeAt(that.createItemForm);
		ui.createItemArea = new ItemEntryArea(that._storageService, that.createExpenseArea);
		ui.recentExpenses = new RecentExpensesTable(that, ui, that._storageService.createStore(), that.recentExpenses);
		ui.expensesDateFilterDialog = new DateFilterDialog();
		ui.expensesDateFilterDialog.setLauncher(that.expensesDateFilterLauncher);
		ui.expensesDateFilterDialog.on("ft:filterChange", function(filter) {
			that.emit("ft:filterChange", filter);
		});
		ui.itemEditDialog = new ItemEditDialog(that._storageService, that.editExpenseDialog);
		ui.importExpensesDialog = that.importExpensesDialog;
		ui.importExpensesDialog.setExpensesService(that._storageService);
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
//		var couchStore = storageService.createStore();
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

		on(that, "ft:filterChange", function(filter) {
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
			ui.itemEditDialog.edit(getPlainObject(selItem));
		}


		that.expenseItemEdit.on("click", editSelectedExpense);
		that.expenseItemDelete.on("click", function() {
			var selItems = grid.selection.getSelected();
			if(confirm("Do you really want to remove following expenses?\n" +
				shortExpenseInfo(selItems).join("\n"))) {
				that._storageService.remove(selItems).then(function() {
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




	return declare("components.StoragePanel", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented], {
		templateString: template,

		_ui: {},

		_settings: {},

		_storageService: null, //to be defined in subclass

		_ItemFormComponent: null, //to be defined in subclass

		constructor: function(settings) {
			var that = this;
			this._settings = settings;
		}, //end constructor

		postCreate: function() {
			var domNode = this.domNode;
			initUI(this, this._ui);
		}
	})//end declare
});
	
