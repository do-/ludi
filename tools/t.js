var path    = system.args [1];
var d       = new Directory(path);
var files   = d.listFiles ();
var t_files = [];
for (var i = 0; i < files.length; i ++) {
	var file = files [i];
	if (!/\.t$/.test (file)) continue;
	t_files.push (file);
} 
t_files = t_files.sort ();

var out = new File (path + '/t.coffee');
out.open  ('w');
out.write ('assert = require("assert")\n');
out.write ('__test = {}\n');
for (var i = 0; i < t_files.length; i ++) {
	var file  = t_files [i];
	var inn   = new File (path + '/' + file);
	inn.open ('r');
	var name  = file.replace (/\.t$/, '');
	out.write ('__test.test_' + name + ' = () ->\n');
	var lines = inn.read ().split (/\n/);
	for (var j = 0; j < lines.length; j ++) {
		out.write ('    ' + lines [j] + '\n');
	}
	inn.close ()
} 
out.write ('require("test").run(__test)\n');
out.close ()