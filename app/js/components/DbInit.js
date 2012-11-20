define(["dojo/DeferredList", "components/Utils"], 
function(DeferredList, Utils) {
return components.DbInit = function(settings, loginController) {
this.ensureDbExists = function() {
	var defExp = ensureStorageExists(settings.storage.expensesStore).then( 
	function() {
		console.log("on expenses ensured");
		return ensureDesignDoc(settings.storage.expensesStore, 
			"js/db/logic.js", "/_design/logic");
		});
	var defStat = ensureStorageExists(settings.storage.statusStore);
	var defAll = new dojo.DeferredList([defExp, defStat], false, true);
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
			console.log("got error", error, ioargs);
			if(ioargs.xhr.status == 404) {
				createStorage(storageName).then(//TODO i beleive it can be simplified
					function(succ) {def.resolve(succ);
						dojo.publish("toasterMessageTopic", {message: "Storage created:"+storageName, type: "info", duration: 1000});},
					function(err) {def.reject(err)});
			} else if(ioargs.xhr.status == 401) {
				console.log("not authenticated");
				Utils.joinDef(loginController.logIn().then(
					function() {
							ensureStorageExists(storageName);
						}), def);
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
		var jsTail = ".js";
		if(fileName.substr(-jsTail.length) == jsTail) {//TODO extract function
			content = dojo.toJson(dojo.fromJson(content));
		}
		return dojo.xhrPut({
			url: settings.storage.url+dbName+docId,
			putData: content
		});
	});
}

};//end dbInit
});
