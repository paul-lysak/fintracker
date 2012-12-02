fintracker
==========

Personal finance accounting with frontend in Dojo and data storage in CouchDB. Thus JavaScript code directly talks to database.
Its current functionality is very limited: CRUD operations on expenses, filtering expenses by date and import/export via CSV format.
The work is in progress to make it full-featured. See TODO.txt for the nearest plans.
Feel free to contact me at paul.lysak@gmail.com if something is unclear! 

How To Run Fintracker
=====================

Fintracker needs CouchDB version 1.1 or later (due to modules usage in design documents) and some web-server that can work as a reverse proxy.
Easiest way to run the application is via scripts in scripts/ folder. Currently they're only available for Unix-like systems and nginx web-server. 
Before you can do it you need to copy (and optionally customize) some configuration files:
1. Folder app/config_sample/ -> app/config/. Contains file FintrackerConfig.js where you can set URL of CouchDB server and names of Fintracker databases.
2. File scripts/couchdb.ini.sample -> scripts/couchdb.ini Overrides some default settings for CouchDB including port number, storage directory location, log files location
3. File scripts/nginx.conf.sample -> scripts/nginx.conf Settings for nginx web-server: to which port it should bind, where should map CouchDB database
4. Run start_dev_env.sh to run both CouchDB and nginx. If you press Ctrl+C in colsole they both will stop. If you prefer to run them separately in different consoles there are start_couchdb.sh and start_nginx.sh scripts.
5. You may use application. Default URL for application is http://localhost:7070, for CouchDB console - http://localhost:7000/_utils/ 
After you open the application for the first time it will create databases on CouchDB server and upload design document there.

For the production deployment you'll probably have servers started by init-scripts so you'll need slightly different approach which depends on your environment
and preferred web-server. Here is my suggestion with nginx:
1. copy (and optionally customize) sampes/fintracker-site file to /etc/nginx/sites-available/
2. go to /etc/nginx/sites-enabled/
3. make a symlink: sudo ln -s /etc/nginx/sites-available/fintracker-site fintracker-site
4. copy content of app/ directory to folder served by web-server. With default fintracker-site file it's /var/web-content/fintracker/
5. start (or restart) nginx
6. make sure CouchDB is running
7. now you may use applicaion. Default URL is http://localhost:7080/, CouchDB console - http://localhost:5984/_utils/

Securing The Application
========================

On default CouchDB installation there's no users and anybody can do anything.
In order to restrict users you need to do following:
1. Open CouchDB web console
2. Click "Set up admin" and follow the instructions
2. Log out from console.
3. Click "Signup" to create new user and follow the instructions
4. Re-login as an admin
5. Click database name you'd like to secure (fintracker_expenses and fintracker_status are default DB names)
6. Click "Security..."
7. Specify at least one admin and at least 1 regular user. Click "Update". 

Now your database is secured. Next time you open the application you'll be prompted for username and password.
Application can be used by regular user, no admin right needed.
However if you didn't open the application before you don't have databases yet so you can't do steps 5 to 7. 
Then you'll need to login as admin into the application
in order to create databases and then return to steps 4 to 7 in order to complete securing.


Unit Tests
==========

Currently there is a handful of unit-tests written with Dojo DOH testing framework. If you'd like to run them you can use scripts/serve_tests.sh script. You'll need Python v.2 or v.3 for this.
Then you can open http://localhost:8000/test/runTests.html in your browser to run the tests.

License
=======

Licensed under Apache 2.0 license: http://www.apache.org/licenses/LICENSE-2.0.txt
