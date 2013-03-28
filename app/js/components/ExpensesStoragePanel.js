define(["dojo/_base/declare", 
	"dojo/_base/lang", 
	"components/Utils",
	"components/StoragePanel",
	"components/ExpenseForm"
	],
function(declare, 
		lang, 
		utils, 
		StoragePanel,
		ExpenseForm
		){

	return declare("components.ExpensesStoragePanel", [StoragePanel], {
		//TODO move here all expenses-specific code from StoragePanel

		constructor: function(settings) {
			this._expensesService = new components.CouchStoreService(settings, "expensesStore");

			this._ItemFormComponent = ExpenseForm;
		}, //end constructor

	});
});
