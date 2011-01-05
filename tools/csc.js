var that = include  ('coffee-script');
var file = new File (system.args [1]);
file.open ('r');
system.stdout       (that.CoffeeScript.compile (file.read (), {bare: true}));
