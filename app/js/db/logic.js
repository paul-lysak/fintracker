{"_id": "_design/logic",
	"utils": 
		"exports.getCsvHeader = function(obj) { "+
					"var ret = '';"+
					"for(key in obj) {"+
					"if(!obj.hasOwnProperty(key)) continue;"+
					"if(ret != '') ret += ', ';"+
					"ret += key}"+
					"return ret;};\n"+
		"exports.getCsvRow = function(obj) { "+
					"var ret = '';"+
					"for(key in obj) {"+
					"if(!obj.hasOwnProperty(key)) continue;"+
					"if(ret != '') ret += ', ';"+
					"ret += obj[key]}"+
					"return ret;}\n", //TODO escaping

	"views": {
		"byDate": {
			"map": "function(doc) {emit(doc.expDate, doc); "+
						"/*TODO avoid emitting doc*/}" 
		}
	},
	"lists": {//TODO CSV header
		"asCsv": "function(head, req) {"+
		"var utils = require('utils');"+
		"var outRows=[];"+
		"var row=getRow();"+
		"if(!row) return '';"+
		"outRows.push(utils.getCsvHeader(row.value));"+
		"while(row) {"+
			"outRows.push(utils.getCsvRow(row.value));"+
			"row=getRow();"+
		"};"+
		"return outRows.join('\\n');}",
		"probe": "function() {return 'hi there'}"
	}
}
