V8_CHROME_SQLITE_SOURCES=$(COMMON_SOURCES) $(SQLITE_SOURCES) js/gears.coffee js/gears/sqlite.coffee
V8_CHROME_SQLITE_OBJECTS=$(V8_CHROME_SQLITE_SOURCES:.coffee=.js)
V8_CHROME_SQLITE_LIB=../compiled/ludi_v8_chrome_sqlite.js

TEST_SCRIPT_V8_CHROME_SQLITE=t/test_v8_chrome_sqlite.js

$(V8_CHROME_SQLITE_LIB):  $(V8_CHROME_SQLITE_OBJECTS)
	$(CSL) $(V8_CHROME_SQLITE_OBJECTS)$(MINIFY) > $(V8_CHROME_SQLITE_LIB)

test_script_v8_chrome_sqlite: $(V8_CHROME_SQLITE_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(V8_CHROME_SQLITE_LIB) ../local/chrome_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_V8_CHROME_SQLITE)

test_v8_chrome_sqlite: test_script_v8_chrome_sqlite
	$(CHROME_BROWSER) c:\projects\eludia_cs\coffee\t\v8_chrome_sqlite.html