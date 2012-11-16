{"_id": "_design/logic",
	"utils": 
		"exports.getCsvHeader = function(obj) { "+
					"var ret = '';"+
					"for(key in obj) {"+
					"if(!obj.hasOwnProperty(key)) continue;"+
					"if(ret != '') ret += ',';"+
					"ret += key}"+
					"return ret;};\n"+
		"exports.getCsvRow = function(obj) { "+
					"function escapeCsvStr(val) {"+
						"return '\"'+val.replace(/\"/g, '\"\"')+'\"'"+
					"}"+
					"function formatVal(val) {"+
						"if(typeof val == 'string') {"+
							"return escapeCsvStr(val);"+
						"} else {"+
							"return val.toString();"+
						"}"+
					"}"+
					"var cols = [];"+
					"for(key in obj) {"+
						"if(!obj.hasOwnProperty(key)) continue;"+
						"cols.push(formatVal(obj[key]))"+
					"}"+
					"return cols.join(',');"+
				"}", 

	"views": {
		"byDate": {
			"map": "function(doc) {emit(doc.expDate, doc); "+
						"/*TODO avoid emitting doc*/}" 
		}
	},
	"lists": {
		"asCsv": "function(head, req) {"+
				"start({headers: {'content-type': 'text/csv', 'content-disposition': 'attachment; filename=export.csv'}});"+
				"var utils = require('utils');"+
				"var outRows=[];"+
				"var row=getRow();"+
				"if(!row) return '';"+
				"send(utils.getCsvHeader(row.value));"+
				"send('\\n');"+
				"while(row) {"+
					"send(utils.getCsvRow(row.value));"+
					"send('\\n');"+
					"row=getRow();"+
				"};"+
			"}"
	}
}
