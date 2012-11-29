#!/bin/bash
# needs bash (not sh) for better signal trapping 
./start_couchdb.sh &
./start_nginx.sh & 
trap 'kill -1 $(jobs -r -p)' SIGINT SIGTERM EXIT KILL
wait
