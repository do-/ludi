var a = system.args;

var l = a.length;

for (var i = 1; i < l; i++) {
	
	var file = new File (a [i]);

	if (file.exists ()) file.remove ();

}