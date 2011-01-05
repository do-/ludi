var a = system.args;

var l = a.length;

for (var i = 1; i < l; i++) {
	
	var file = new File (a [i]);

	file.open ('r');
	
	system.stdout (file.read ());
	system.stdout ("\n");

}