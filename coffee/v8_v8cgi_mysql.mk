V8_V8CGI_MYSQL_SOURCES=$(COMMON_SOURCES) $(MYSQL_SOURCES) js/v8.coffee js/v8_v8cgi.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/mysql.coffee
V8_V8CGI_MYSQL_OBJECTS=$(V8_V8CGI_MYSQL_SOURCES:.coffee=.js)
V8_V8CGI_MYSQL_LIB=../js/ludi_v8_v8cgi_mysql.js

TEST_SCRIPT_V8_V8CGI_MYSQL=t/test_v8_v8cgi_mysql.js

$(V8_V8CGI_MYSQL_LIB):  $(V8_V8CGI_MYSQL_OBJECTS)
	$(CSL) $(V8_V8CGI_MYSQL_OBJECTS) $(MINIFY) > $(V8_V8CGI_MYSQL_LIB)

test_script_v8_v8cgi_mysql: $(V8_V8CGI_MYSQL_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(V8_V8CGI_MYSQL_LIB) ../js/mysql_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_V8_V8CGI_MYSQL)

test_v8_v8cgi_mysql: test_script_v8_v8cgi_mysql	
	$(V8_V8CGI_BIN)../coffee/$(TEST_SCRIPT_V8_V8CGI_MYSQL)
