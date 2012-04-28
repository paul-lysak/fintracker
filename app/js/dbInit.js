var DbInit = function(settings) {

dojo.require("dojo.DeferredList");

this.ensureDbExists = function() {
	var defExp = ensureStorageExists(settings.storage.expensesStore).then( 
	function() {
		console.log("on expenses ensured");
		return ensureDesignDoc(settings.storage.expensesStore, 
			"js/db/logic.json", "/_design/logic");
		});
	var defStat = ensureStorageExists(settings.storage.statusStore);
	var defAll = new dojo.DeferredList([defExp, defStat]);
	return defAll;
}

function ensureStorageExists(storageName) {
	var def = new dojo.Deferred();
	function createStorage(storageName) {
		return dojo.xhrPut({
		url: settings.storage.url+storageName
		});
	}

	dojo.xhrGet({
		url: settings.storage.url+storageName ,
		load: function(data) {
			console.log("ok, db esists:"+storageName,  data);
			def.resolve(data);
			},
		error: function(error, ioargs) {
			if(ioargs.xhr.status == 404) {
				createStorage(storageName).then(//TODO i beleive it can be simplified
					function(succ) {console.log("create storage succ"); def.resolve(succ)},
					function(err) {def.reject(err)});
			} else {
				def.reject(error);
			}		
		},
	failOk: true
		});
	return def;
}

function ensureDesignDoc(dbName, fileName, docId) {
	return dojo.xhr("HEAD", {
		url: settings.storage.url+dbName+docId}).then(function(res) {
			console.log(dbName+docId+" found, no need to upload")},
		function(err) {
			if(err.status == 404)
				return uploadDocFromFile(dbName, fileName, docId);
		});
}

function uploadDocFromFile(dbName, fileName, docId) {
	return dojo.xhrGet({
		url: fileName
	}).then(function(content) { 
		return dojo.xhrPut({
			url: settings.storage.url+dbName+docId,
			putData: content
		});
	});
}

};//end dbInit

