#!/bin/bash
#Trap needed when we start this script in a background of another script
#Otherwise couchdb doesn't stop
trap 'kill -1 $(jobs -r -p)' SIGINT SIGTERM EXIT KILL
couchdb -a couchdb.ini
