#!/bin/sh
#Needs curl utility to run
COUCHDB_URI=http://admin:admin@localhost:5984/
EXPENSES_URI=${COUCHDB_URI}fintracker_expenses/
EXP_DESIGN_URI=${EXPENSES_URI}_design/logic

old_design=$(curl -s -X GET $EXP_DESIGN_URI)

case "$old_design" in
	*error* ) 
	echo "skip deletion of _design/logic"
	echo "old_design=$old_design"
	;;
	*) 
	rev=$(echo $old_design | sed -n 's/.\+"_rev":"\([0-9a-z\-]\+\)".*/\1/pg');
	echo removing _design/logic document with rev=$rev...
	curl -X DELETE $EXP_DESIGN_URI?rev=$rev
	;;
esac

