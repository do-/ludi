MONKEY_FF_SQLITE_SOURCES=$(COMMON_SOURCES) $(SQLITE_SOURCES) js/gears.coffee js/gears/sqlite.coffee
MONKEY_FF_SQLITE_OBJECTS=$(MONKEY_FF_SQLITE_SOURCES:.coffee=.js)
MONKEY_FF_SQLITE_LIB=../js/ludi_monkey_ff_sqlite.js

TEST_SCRIPT_MONKEY_FF_SQLITE=t/test_monkey_ff_sqlite.js

$(MONKEY_FF_SQLITE_LIB):  $(MONKEY_FF_SQLITE_OBJECTS)
	$(CSL) $(MONKEY_FF_SQLITE_OBJECTS)$(MINIFY) > $(MONKEY_FF_SQLITE_LIB)

test_script_monkey_ff_sqlite: $(MONKEY_FF_SQLITE_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(MONKEY_FF_SQLITE_LIB) ../js/chrome_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_MONKEY_FF_SQLITE)

test_monkey_ff_sqlite: test_script_monkey_ff_sqlite
	$(FF_BROWSER) c:\projects\eludia_cs\coffee\t\monkey_ff_sqlite.html
