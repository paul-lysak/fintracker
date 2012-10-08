define(["dojo/_base/declare"],
function(declare) {
	var fieldStartState = {
	};
	//TODO other states
	var CsvBatchParser = declare([], {
		constructor: function() {
			this._remainderText = "";
			this._remainderFields = [];
		},

		parse: function(batch) {
			return [];
		},

		end: function() {
			return [];
		}
		//TODO complete parser
	});

	var ImportSession = declare([], {

		constructor: function() {
			this._parser = new CsvBatchParser();
		},
		
		_importObjects: function(objects) {
			//TODO
		},

		importPart: function(part) {
			var objects = this._parser.parse(part);
			console.log("importPart;", part, objects);
			this._importObjects(objects);
		},

		end: function() {
			var objects = this._parser.end();
			this._importObjects(objects);
		}
	});

	return declare("components.CsvExpensesImportHandler", [], {
		startSession: function() {
			return new ImportSession();
		}
	});
});
