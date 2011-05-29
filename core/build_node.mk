CSC=coffee -c -b
CSL=cat
RM=rm -f
T=$(V8_V8CGI_BIN)t_node.js

.coffee.js:
	$(CSC) $<
