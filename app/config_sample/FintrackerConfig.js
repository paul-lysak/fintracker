define(["dojo/_base/lang", "config_default/FintrackerConfigDefault"], 
function(lang, FintrackerConfigDefault) {
return lang.delegate(FintrackerConfigDefault, {
		settings: {
			storage: {type: "couchdb",
			url: "http://localhost:7070/couchdb/", 
			expensesStore: "fintracker_expenses",
			statusStore: "fintracker_status"
			}
		}
	});
});
