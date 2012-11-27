define([], {
	settings: {
		storage: {type: "couchdb",
		url: "http://localhost:7070/couchdb/", 
		expensesStore: "fintracker_expenses",
		statusStore: "fintracker_status"
		}
	},
	categories: {
		other: "Uncategorized",
		food: "Food and drink",
		car: "Car (fuel, repair, etc.)",
		household: "Household (payments, repairs, etc.)",
	}
});
