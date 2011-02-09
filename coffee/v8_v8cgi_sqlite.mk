V8_V8CGI_SQLITE_SOURCES=$(COMMON_SOURCES) $(SQLITE_SOURCES) js/v8_v8cgi.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/sqlite.coffee
V8_V8CGI_SQLITE_OBJECTS=$(V8_V8CGI_SQLITE_SOURCES:.coffee=.js)
V8_V8CGI_SQLITE_LIB=../js/ludi_v8_v8cgi_sqlite.js

TEST_SCRIPT_V8_V8CGI_SQLITE=t/test_v8_v8cgi_sqlite.js

$(V8_V8CGI_SQLITE_LIB):  $(V8_V8CGI_SQLITE_OBJECTS)
	$(CSL) $(V8_V8CGI_SQLITE_OBJECTS)$(MINIFY) > $(V8_V8CGI_SQLITE_LIB)

test_script_v8_v8cgi_sqlite: $(V8_V8CGI_SQLITE_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(V8_V8CGI_SQLITE_LIB) ../js/sqlite_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_V8_V8CGI_SQLITE)

test_v8_v8cgi_sqlite: test_script_v8_v8cgi_sqlite
	$(V8_V8CGI_BIN)../coffee/$(TEST_SCRIPT_V8_V8CGI_SQLITE)
