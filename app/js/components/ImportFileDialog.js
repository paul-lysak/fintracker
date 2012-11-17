define(["dojo/_base/declare",
	"dojo/_base/array",
	"dojo/on",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
	"dijit/ProgressBar",
	"components/CsvStreamingParser",
	"dojo/text!./templates/ImportFileDialog.html",
	"components/Utils",
	],
function(declare, array, on, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, ProgressBar, CsvBatchParser, dialogTemplate, utils) {
	CsvImportSession = declare([], {
		constructor: function(service) {
			this._parser = new CsvBatchParser();
			this._service = service;
		},

		importPart: function(part) {
			var items = this._parser.parse(part);
			array.forEach(items, function(item) {
				this._service.insert(item);
				//TODO insert preserving id and rev
			}, this);
		},

		end: function() {
			var item = this._parser.end();
			if(item) 
				this._service.insert(item);
		}
	});

	return declare("components.ImportFileDialog", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], 
	{
		templateString: dialogTemplate,
		
		_chunkSize: 20,

		_readFile: function(file) {
			var importSession = new CsvImportSession(this._service);
			var def = new dojo.Deferred();
			function readPart(startByte, endByte, chunkSize, fileSize) {
				endByte = utils.min(endByte, fileSize);
				if(startByte >= file.size) {
					importSession.end();
					def.resolve();
					//TODO handle error
				} else {
					var reader = new FileReader();
					var chunk = file.slice(startByte, endByte);
					reader.readAsBinaryString(chunk);
					reader.onloadend = function(evt) {
						if (evt.target.readyState == FileReader.DONE) {
							importSession.importPart(evt.target.result);	
							//TODO remove setTimeout after debug
							readPart(startByte + chunkSize, endByte+chunkSize, chunkSize, fileSize);
						}
					}
					def.progress({total: fileSize, processed: startByte});
				}
			}
			readPart(0, this._chunkSize, this._chunkSize, file.size);
			return def;
		},

		_handleImportStart: function(files) {
			var defs = [];
			for(var i = 0, file; file = files[i]; i++) {
				defs.push(this._readFile(file));
			}
			if(defs.length == 1)
				return defs[0];
				//TODO support progress for multiple files
			else
				return new dojo.DeferredList(defs);
		},

		postCreate: function() {
			var that = this;
			this.cancelButton.on("click", function(ev) {
				that.dialogDijit.hide();
			});
			this.okButton.on("click", function(ev) {
				that._handleImportStart(that.fileInput.files).then(
					function() {
						that.dialogDijit.hide();
					},
					function() {
						alert("Failed to import data");
						//TODO use toaster messages
						that.dialogDijit.hide();
					},
					function(upd) {
						that.progressBar.set("maximum", upd.total);
						that.progressBar.set("value", upd.processed);
					}
					);
			});
		},

		show: function() {
			this.dialogDijit.show();	
		},

		setExpensesService: function(service) {
			this._service= service;
		}
	});

	
});
