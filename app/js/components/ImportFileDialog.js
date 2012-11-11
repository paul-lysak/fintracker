define(["dojo/_base/declare",
	"dojo/_base/array",
	"dojo/on",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
	"components/CsvBatchParser",
	"dojo/text!./templates/ImportFileDialog.html",
	"components/Utils",
	],
function(declare, array, on, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, CsvBatchParser, dialogTemplate, utils) {
	CsvImportSession = declare([], {
		constructor: function() {
			this._parser = new CsvBatchParser();
		},

		importPart: function(part) {
			var items = this._parser.parse(part);
			console.log("got items", part, items);
		},

		end: function() {
			var item = this._parser.end();
			console.log("got last item", item);
		}
	});

	return declare("components.ImportFileDialog", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], 
	{
		templateString: dialogTemplate,
		
		_chunkSize: 20,

		_readFile: function(file) {
			var importSession = new CsvImportSession();
			function readPart(startByte, endByte, chunkSize, fileSize) {
				endByte = utils.min(endByte, fileSize);
				if(startByte >= file.size) {
					importSession.end();
				} else {
					var reader = new FileReader();
					var chunk = file.slice(startByte, endByte);
					reader.readAsBinaryString(chunk);
					reader.onloadend = function(evt) {
						if (evt.target.readyState == FileReader.DONE) {
							importSession.importPart(evt.target.result);	
							readPart(startByte + chunkSize, endByte+chunkSize, chunkSize, fileSize);
						}
					}
				}
			}
			readPart(0, this._chunkSize, this._chunkSize, file.size);
			//TODO return promise
		},

		_handleImportStart: function(files) {
			//TODO return promise
			for(var i = 0, file; file = files[i]; i++) {
				this._readFile(file);
			}
		},

		postCreate: function() {
			var that = this;
			this.cancelButton.on("click", function(ev) {
				that.dialogDijit.hide();
			});
			this.okButton.on("click", function(ev) {
				that._handleImportStart(that.fileInput.files);	
				//TODO close dialog when import ends
			});
		},

		show: function() {
			this.dialogDijit.show();	
		},

		setImportHandler: function(handler) {
			this._importHandler = handler;
		}
	});

	
});
