define(["dojo/_base/declare"],
function(declare) {
	var S_FIELD_START = 1;
	var S_FIELD_QUOTED = 2;
	var S_FIELD_UNQUOTED = 3;

	return declare("CsvBatchParser", [], {
		constructor: function() {
			this._remainderText = "";
			this._remainderParts = [];
			this._fieldKeys = [];
		},

		buildObject : function(parts, keys) {
			var ret = {};
			for(var f=0; f<keys.length; f++) {
				ret[keys[f]] = f < parts.length ? parts[f] : undefined; //TODO convert types, strip quotes, trim spaces
			}
			return ret;
		},
		
		parse: function(batch) {
			var ret = [];
			batch = this._remainderText + batch;
			var partStart = 0;
			var prevQuote = false;
			var inQuotes = false;
			for(var i=0; i < batch.length; i++) {
				if (batch[i] == '\n') {
					if(this._fieldKeys.length > 0)
						ret.push(this.buildObject(this._remainderParts, this._fieldKeys));
					else
						this._fieldKeys = this._remainderParts;
					this._remainderParts = [];
				}
				else if (batch[i] == '"') {
					inQuotes = !inQuotes && !prevQuote; 
					prevQuote = !prevQuote;
				} else if (batch[i] == ',' && (!inQuotes || prevQuote)) { //TODO make separator configurable
					this._remainderParts.push(batch.substring(partStart, i));
					partStart = i+1;
				}
			}
			this._remainderText = batch.substring(partStart, batch.length);
			return ret; 
		},

		end: function() {
			if(this._remainderText.length > 0) { //TODO trim
				this._remainderParts.push(this._remainderText);
				this._remainderText = "";
			}
			if(this._fieldKeys.length == 0) {
				this._fieldKeys = this._remainderParts;
				this._remainderParts = [];
			}
			return this._remainderParts.length > 0 
				? this.buildObject(this._remainderParts, this._fieldKeys)
				: null;
		}
	});
});
