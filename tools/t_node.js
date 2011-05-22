var fs      = require ('fs');
var path    = process.argv [2];
var files   = fs.readdirSync(path);
var t_files = [];
for (var i = 0; i < files.length; i ++) {
	var file = files [i];
	if (!/\.t$/.test (file)) continue;
	t_files.push (file);
} 
t_files = t_files.sort ();

var out = fs.openSync (path + '/t.coffee', 'w');
fs.writeSync (out, '__test = {}\n');
for (var i = 0; i < t_files.length; i ++) {
	var file  = t_files [i];
	var name  = file.replace (/\.t$/, '');
	var s = '__test.test_' + name + ' = () ->\n';
	fs.writeSync (out, s);
	var lines = fs.readFileSync (path + '/' + file, 'utf-8').split (/\n/);
	for (var j = 0; j < lines.length; j ++) {
		s = '    ' + lines [j] + '\n';
		fs.writeSync (out, s);
	}
	s = '__test.test_' + name + '()\n';
	fs.writeSync (out, s);
}