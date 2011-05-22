CSC=coffee -c
CSL=cat
RM=rm -f

.coffee.js:
	$(CSC) $<
