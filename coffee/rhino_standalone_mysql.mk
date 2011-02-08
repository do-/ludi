RHINO_STANDALONE_MYSQL_SOURCES=$(COMMON_SOURCES) $(MYSQL_SOURCES) js/rhino.coffee js/rhino/mysql.coffee
RHINO_STANDALONE_MYSQL_OBJECTS=$(RHINO_STANDALONE_MYSQL_SOURCES:.coffee=.js)
RHINO_STANDALONE_MYSQL_LIB=../js/ludi_rhino_standalone_mysql_lib.js

TEST_SCRIPT_RHINO_STANDALONE_MYSQL=t/test_rhino_standalone_mysql.js

$(RHINO_STANDALONE_MYSQL_LIB):  $(RHINO_STANDALONE_MYSQL_OBJECTS)
	$(CSL) ../js/json2.js $(RHINO_STANDALONE_MYSQL_OBJECTS)$(MINIFY) > $(RHINO_STANDALONE_MYSQL_LIB)

test_script_rhino_standalone_mysql: $(RHINO_STANDALONE_MYSQL_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(RHINO_STANDALONE_MYSQL_LIB) ../js/mysql_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_RHINO_STANDALONE_MYSQL)

test_rhino_standalone_mysql: test_script_rhino_standalone_mysql	
	$(RHINO_BIN) ../coffee/$(TEST_SCRIPT_RHINO_STANDALONE_MYSQL)
