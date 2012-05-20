define(["dojox/rpc/Rest"], 
function(Rest) {
return function(backendSettings, storeName) {
	var storeURL = backendSettings.storage.url+backendSettings.storage[storeName]+"/";

	var restStore = Rest(storeURL, true);
	
	//returns deferred with promise containing uuid string
	this.askUuid = function() {
		var def = dojo.xhrGet({
			url: backendSettings.storage.url+"_uuids",
			handleAs: "json"});
		def = def.then(function(uuidsObj){
				return uuidsObj.uuids[0];
				});
		return def;
	}

	this.insert = function(obj) {
		var def = new dojo.Deferred();
		this.askUuid().then(function(uuid) {
				var p = restStore.put(uuid, dojo.toJson(obj)).
			then(function(put_res) {
						def.resolve(put_res);
						dojo.publish("insert_"+storeName, obj);
						},
					function(put_err) {
						def.reject(put_err);}
				);
		}, function(uuid_err) {
			def.reject(uuid_err);
		});
		return def;
	}

	this.remove = function(objs) {
		var def;
		if(objs.length == 1) {
			var item = objs[0];
			def = restStore.delete(item._id+"?rev="+item._rev);	
		} else {
			var bulkBody = {docs: []};
			objs.forEach(function(item) {
				bulkBody.docs.push({_id: item._id, _rev: item._rev, _deleted: true});
			});
			def = restStore.post("_bulk_docs", dojo.toJson(bulkBody));
		}
		return def.then(function() {
			dojo.publish("remove_"+storeName, objs);
		});
	}

	this.update = function(obj) {
		return restStore.put(obj._id, dojo.toJson(obj)).then(
			function() {
				dojo.publish("update_"+storeName, obj);
			});
	}
};
});
