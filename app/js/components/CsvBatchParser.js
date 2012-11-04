define(["dojo/_base/declare"],
function(declare) {
	return declare("CsvBatchParser", [], {
		constructor: function() {
			this._remainderText = "";
			this._remainderFields = [];
			this._fieldKeys = [];
		},

		parse: function(batch) {
			return [];
		},

		end: function() {
			return [];
		}
		//TODO complete parser
	});
});
