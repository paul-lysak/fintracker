define(["dojo/_base/declare", 
	"dojo/_base/lang", 
	"components/Utils",
	"components/StoragePanel"
	],
function(declare, 
		lang, 
		utils, 
		StoragePanel
		){

	return declare("components.ExpensesStoragePanel", [StoragePanel], {
		//TODO move here all expenses-specific code from StoragePanel
	});
});
