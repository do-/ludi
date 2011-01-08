1. WARNING

This software is still in early pre-alpha development stage.
The documentation LACKS.

2. DESCRIPTION

Ludi.js is [meant to be] a javaScript (js) web application development platform.

For all Eludia.pm experts, Ludi.js is Eludia.pm rewritten 
to javaScript and without any buit-in native presentation layer.

For the rest of audience, Ludi.js is a library connecting different 
server side and offline js engines such as

* node.js
* v8cgi
* Google Gears
* Adobe AIR
* Mozilla Rhino
* MS JScript

(with their server APIs and database drivers) to modern AJAX widget sets like

* Sencha ExtJS
* DynarchLIB
* DHTMLX
* jsLinb (== Sigma Widgets)
* ZKuery (zk MINUS servlets)

The main goal of the project is to provide a unified handy minimalistic API
for developing portable Web applications targeting js as a core platorm.

Ludi.js is presented as multiple 'libraries' each of which represent a 
unique combination of 

* a js engine
* a DBMS
* a DB driver for that js engine 

and so on.

A well written Ludi.js application should run smoothly with any of these
libraries without any changes.

3. INSTALLATION

3.1. make

Ludi.js project produces several libraries by combining multiple sources.
The classical Makefile is used for this task. The syntax must comply
to GNU make. Under WinXP both

* nmake (http://download.microsoft.com/download/vc15/patch/1.52/w95/en-us/nmake15.exe)
* dmake (http://search.cpan.org/dist/dmake/)

are good.

3.2. v8cgi

As of now, Ludi.js is developed under WinXP with v8cgi as a bootstrap 
platform. In theory, any standalone command line js interpreter and any OS
should go. So, to reproduce the original setup, first download and install

	http://code.google.com/p/v8cgi/

3.3. CoffeeScript

Ludi.js itself is written not in bare js but in CoffeeScript (cs). CS is a 
little bit higher level language that fixes many of original js annoyances being
100% compatible with it. Please store

	http://jashkenas.github.com/coffee-script/extras/coffee-script.js

as 'lib/coffee-script.js' in your v8cgi directory

3.4. Ludi.js itself

Git clone this project somewhere on your disk. Chdir to '/cs'.
Edit the Makefile and make sure that V8CGI_ROOT and V8CGI_BIN are
set correctly. Now 

	nmake test

