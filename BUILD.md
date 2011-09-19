PREREQUISITES
=============

Ludi.js is written is CoffeeScript.

To translate it in pure js, a java implementation of js (Rhino) is used
together with ant, the standard java build tool.

So, to build ludi.js one have to get first up and running the following:

* java 1.6 (or maybe older);
* ant 1.6 (same thing);
* js-ant-tasks (https://github.com/do-/js-ant-tasks).

All the mentioned is required only for build ludi.js, not necessary to run it.

CONFIGURING
===========

All installation specific files are located in the `.local` directory.

1. Copy `build.properties.sample` as `build.properties` and edit it. 
Some properties may appear senseless for your case: say `bin.v8cgi`
if you don't use v8cgi.

2. Copy one of `test_init.*.js.sample` to `test_init.js` and edit it
to fill in valid test DBMS credentials.

BUILDING ITSELF
===============

Choose a target and invoke `ant` for it. Then the following will happen:

* CoffeeScript will be translated to javaScript;
* the needed ones will be concatenated into one library file: `build/bin/ludi.js`;
* it will be optimized with YUI Compressor resulting `dist/ludi.js`;
* a test script will be built and run iimediately.

Futhermore, individual build targets are explained.

build_rhino_mysql
-----------------

The resulting library is meant to be loaded into some java program (with Rhino) and 
interact with MySQL server using JDBC driver.

To run tests, you must set `bin.rhino` to the name of a hand written script like

	java -cp C:\Progra~1\Rhino\js.jar;C:\Progra~1\Rhino\mysql-connector-java-5.1.14-bin.jar org.mozilla.javascript.tools.shell.Main -O -1 %1
	
build_ms_mysql
--------------

This builds the library for MS IIS ASPs written in JScript. Currently, it 
uses the standard ADO/ODBC bridge so you have to set up a system ODBC datasource
named the same way as your test database. Moreover, the default IIS virtualhost
must have the `test` directory as document root and honor `default.asp`
written in JScript.

build_v8cgi_mysql
-----------------

Here we have a library for v8cgi and MySQL. `bin.v8cgi` and `bin.v8cgi.conf`
must point to the standalone v8cgi binary and its configuration file, respectively.


build_v8cgi_sqlite
------------------

Nearly the same thing as above, but with SQLite as database.

build_node_mysql
----------------

The library for node.js and MySQL. 