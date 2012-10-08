define(["dojo/_base/declare",
	"dojo/_base/array",
	"dojo/on",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
	"dojo/text!./templates/ImportFileDialog.html",
	"components/Utils",
	],
function(declare, array, on, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, dialogTemplate, utils) {

	return declare("components.ImportFileDialog", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], 
	{
		templateString: dialogTemplate,
		
		_importHandler: null,

		_chunkSize: 10,

		_readFile: function(file) {
			if(!this._importHandler) {
				console.error("No import handler");
				return;
			}
			var importSession = this._importHandler.startSession();
			var startByte=0, endByte = utils.min(this._chunkSize, file.size);
			while(startByte<file.size) {
				var reader = new FileReader();
				reader.onloadend = function(evt) {
					if (evt.target.readyState == FileReader.DONE) {
						importSession.importPart(evt.target.result);	
					}
				}
				var chunk = file.slice(startByte, endByte);
				reader.readAsBinaryString(chunk);

				startByte += this._chunkSize;
				endByte = utils.min(endByte+this._chunkSize, file.size);
			}
			importSession.end();
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
