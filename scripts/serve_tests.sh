#!/bin/sh
# Starts simple web-server for running unit tests. 
# Normally server is available at localhost:8000

PROJECT_DIR=`dirname $0`/..
cd $PROJECT_DIR
if which python3; then
	python3 -m http.server
elif which python; then 
	python -m SimpleHTTPServer
else
	echo No python interpreter found - can\'t start server
fi



