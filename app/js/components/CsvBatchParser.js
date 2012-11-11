define(["dojo/_base/declare",
	"dojo/_base/array"],
function(declare, array) {
	function unescapeQuotes(str) {
		if(!str || str[0] != '"')
			return str;
		else 
			return str.substr(1, str.length-2).replace(/""/g, '"');
	}

	function typify(str) {
		if(str.length == 0 ) 
			return str;
		else if(str[0] == '"')
			return unescapeQuotes(str);
		else if(str == "true" || str == "false")
			return str == "true";
		else if(str.match(/^\d+$/))
			return parseInt(str, 10);
		else if(str.match(/^\d+\.\d+$/)) //TODO make decimal separator configurable
			return parseFloat(str, 10);
		else 
			return str;
	}

	return declare("CsvBatchParser", [], {
		constructor: function() {
			this._remainderText = "";
			this._remainderParts = [];
			this._fieldKeys = [];
		},

		buildObject : function(parts, keys) {
			var ret = {};
			for(var f=0; f<keys.length; f++) {
				ret[keys[f]] = f < parts.length ? typify(parts[f]) : undefined; 
			}
			return ret;
		},

		_remainderToKeys: function() {
			this._fieldKeys = array.map(this._remainderParts, unescapeQuotes);
			this._remainderParts = [];
		},

		parse: function(batch) {
			var that = this;
			function isSpace(c) {
				return c == ' ' || c == '\t' || c == '\n' || c == '\r';
			}
			function pushCurrentToRemainder() {
				that._remainderParts.push(batch.substring(firstNonSpace, lastNonSpace+1));
				firstNonSpace = lastNonSpace = -1;
			}
			var ret = [];
			batch = this._remainderText + batch;
			var firstNonSpace = -1;
			var lastNonSpace = -1;
			var prevQuote = false;
			var inQuotes = false;
			for(var i=0; i < batch.length; i++) {
				if (batch[i] == '\n') {
					pushCurrentToRemainder();
					if(this._fieldKeys.length > 0) 
						ret.push(this.buildObject(this._remainderParts, this._fieldKeys));
					else
						this._remainderToKeys();
					this._remainderParts = [];
				} else if (batch[i] == '"') {
					if(inQuotes)
						lastNonSpace = i;
					else
						firstNonSpace = i;
					inQuotes = !inQuotes && !prevQuote; 
					prevQuote = !prevQuote;
				} else if (batch[i] == ',' && (!inQuotes || prevQuote)) { //TODO make fields separator configurable
					pushCurrentToRemainder();
					firstNonSpace = lastNonSpace = i+1
				} else if(!isSpace(batch[i])) {
					lastNonSpace = i;
					if(firstNonSpace == -1 || isSpace(batch[firstNonSpace]))
						firstNonSpace = i;
				}
			}
			this._remainderText = firstNonSpace < 0 ? "" : batch.substring(firstNonSpace, batch.length);
			return ret; 
		},

		end: function() {
			if(this._remainderText.length > 0) { 
				this._remainderParts.push(this._remainderText);
				this._remainderText = "";
			}
			if(this._fieldKeys.length == 0) {
				this._remainderToKeys();
			}
			return this._remainderParts.length > 0 
				? this.buildObject(this._remainderParts, this._fieldKeys)
				: null;
		}
	});
});
