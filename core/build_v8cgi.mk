CSC=$(V8_V8CGI_BIN)csc.js 
CSL=$(V8_V8CGI_BIN)csl.js 
RM=$(V8_V8CGI_BIN)rm.js 
T=$(V8_V8CGI_BIN)t_node.js

.coffee.js:
	$(CSC) $< > $@
