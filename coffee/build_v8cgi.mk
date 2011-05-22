CSC=$(V8_V8CGI_BIN)csc.js 
CSL=$(V8_V8CGI_BIN)csl.js 
RM=$(V8_V8CGI_BIN)rm.js 

.coffee.js:
	$(CSC) $< > $@
