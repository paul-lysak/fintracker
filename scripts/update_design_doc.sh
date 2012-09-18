#!/bin/sh
#Needs curl utility to run
COUCHDB_URI=http://localhost:5984/
EXPENSES_URI=${COUCHDB_URI}fintracker_expenses/
EXP_DESIGN_URI=${EXPENSES_URI}_design/logic

old_design=$(curl -s -X GET $EXP_DESIGN_URI)

case "$old_design" in
	*error* ) 
	echo "skip deletion of _design/logic"
	;;
	*) 
	rev=$(echo $old_design | sed 's/.\+"_rev":"\([0-9a-z\-]\+\)".\+/\1/');
	echo removing _design/logic document with rev=$rev...
	curl -s -X DELETE $EXP_DESIGN_URI?rev=$rev
	;;
esac
#TODO find command-line utility to convert js to json
#echo uploading _design/logic document...
#curl -T../app/js/db/logic.json $EXP_DESIGN_URI
#echo design doc update complete

