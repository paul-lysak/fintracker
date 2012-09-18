{"_id": "_design/logic",
	"utils": 
		"exports.getCsvHeader = function(obj) { "+
					"var ret = '';"+
					"for(key in obj) {"+
					"if(!obj.hasOwnProperty(key)) continue;"+
					"if(ret != '') ret += ', ';"+
					"ret += key}"+
					"return ret;};\n"+
		"exports.objToCsv = function(obj) { "+
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
		"asCsv": "function(head, req) {var utils = require('utils'); var row, outRows=['_id,amount']; while(row=getRow()) {outRows.push(utils.objToCsv(row.value));}; return outRows.join('\\n');}",
		"probe": "function() {return 'hi there'}"
	}
}
