try
	assert.equal "X".by(3),        "XXX", "by"
	assert.equal "z".rpad(3),      "z  ", "rpad 1"
	assert.equal "z".rpad(3, 'z'), "zzz", "rpad 2"
	assert.equal "z".lpad(3),      "  z", "lpad 1"
	assert.equal "z".lpad(3, 'z'), "zzz", "lpad 2"
	assert.equal "2011".lpad(4, '0'), "2011", "lpad 3"
	assert.equal sprintf("Hello, %s!", 'world'), "Hello, world!", "sprintf 1"
	assert.equal sprintf("Hello, %6s!", 'world'), "Hello,  world!", "sprintf 2"
	assert.equal sprintf("Hello, %-6s!", 'world'), "Hello, world !", "sprintf 3"
	assert.equal sprintf("Wake on %02d:%02d", 9, 0), "Wake on 09:00", "sprintf 4"
	
	
	
	
	
	
	type.user = 
		get:    () -> {id:this.REQUEST.id, label: 'test'}
		select: () -> []
		create: () -> -1
	
	server = new Server()
	server.start()	
	
	
	
	
catch e

    say e.stack
    throw e    
