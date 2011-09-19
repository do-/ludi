WARNING
=======

This software is still in early pre-alpha development stage.

DESCRIPTION
===========

Ludi.js is [meant to be] a javaScript (js) web application development platform.

For all Eludia.pm experts, Ludi.js is Eludia.pm rewritten 
to javaScript and without any native presentation layer.

For the rest of audience, Ludi.js is a library connecting different 
server side and offline js engines such as

* node.js
* v8cgi
* Mozilla Rhino
* MS JScript
* maybe Adobe AIR
* maybe HTML5

(with their server APIs and database drivers) to modern AJAX widget sets like

* Sencha ExtJS
* DHTMLX
* jsLinb (== Sigma Widgets)
* ZKuery (zk MINUS servlets)
* DynarchLIB

The main goal of the project is to provide a unified handy minimalistic API
for developing portable Web applications targeting js as a core platorm.

Ludi.js is presented as multiple 'libraries' each of which represent a 
combination of adapters for:

* a js engine
* a DBMS
* a DB driver for that js engine 

and so on.

A well written Ludi.js application should run smoothly with any of these
libraries without any changes.