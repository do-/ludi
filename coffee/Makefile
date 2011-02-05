#MINIFY=| perl -MJavaScript::Minifier -e"print JavaScript::Minifier::minify(input=>*STDIN)"

V8_V8CGI_ROOT=c:\Progra~1\v8cgi\ 
V8_V8CGI_BIN=$(V8_V8CGI_ROOT)v8cgi -c $(V8_V8CGI_ROOT)v8cgi.conf ../tools/

CSC=$(V8_V8CGI_BIN)csc.js 
CSL=$(V8_V8CGI_BIN)csl.js 
RM=$(V8_V8CGI_BIN)rm.js 
T=$(V8_V8CGI_BIN)t.js 

COMMON_SOURCES=ludi.coffee sprintf.coffee log.coffee db.coffee sql.coffee model.coffee wish.coffee wish/table_data.coffee wish/table_data_rooted.coffee wish/table_columns.coffee wish/table_keys.coffee testing.coffee
SQLITE_SOURCES=db/sqlite.coffee db/sqlite/wish/table_columns.coffee db/sqlite/wish/table_keys.coffee
MYSQL_SOURCES=db/mysql.coffee db/mysql/wish/table_columns.coffee db/mysql/wish/table_keys.coffee

V8_V8CGI_SQLITE_SOURCES=$(COMMON_SOURCES) $(SQLITE_SOURCES) js/v8.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/sqlite.coffee
V8_V8CGI_SQLITE_OBJECTS=$(V8_V8CGI_SQLITE_SOURCES:.coffee=.js)
V8_V8CGI_SQLITE_LIB=../js/v8cgi_sqlite.jsl

V8_V8CGI_MYSQL_SOURCES=$(COMMON_SOURCES) $(MYSQL_SOURCES) js/v8.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/mysql.coffee
V8_V8CGI_MYSQL_OBJECTS=$(V8_V8CGI_MYSQL_SOURCES:.coffee=.js)
V8_V8CGI_MYSQL_LIB=../js/v8cgi_mysql.jsl

TEST_SOURCES=t/t.coffee
TEST_OBJECTS=$(TEST_SOURCES:.coffee=.js)
TEST_SCRIPT_V8_V8CGI_SQLITE=t/test_v8_v8cgi_sqlite.js
TEST_SCRIPT_V8_V8CGI_MYSQL=t/test_v8_v8cgi_mysql.js

ALL_TEST_SCRIPTS=$(TEST_SCRIPT_V8_V8CGI_SQLITE) $(TEST_SCRIPT_V8_V8CGI_MYSQL)
ALL_LIBS=$(V8_V8CGI_SQLITE_LIB) $(V8_V8CGI_MYSQL_LIB)
ALL_OBJECTS=$(V8_V8CGI_SQLITE_OBJECTS) $(V8_V8CGI_MYSQL_OBJECTS) $(TEST_OBJECTS)

.SUFFIXES: .js .coffee .t

.coffee.js:
	$(CSC) $< > $@

all: all_libs

$(V8_V8CGI_MYSQL_LIB):  $(V8_V8CGI_MYSQL_OBJECTS)
	$(CSL) $(V8_V8CGI_MYSQL_OBJECTS) $(MINIFY) > $(V8_V8CGI_MYSQL_LIB)

$(V8_V8CGI_SQLITE_LIB):  $(V8_V8CGI_SQLITE_OBJECTS)
	$(CSL) $(V8_V8CGI_SQLITE_OBJECTS)$(MINIFY) > $(V8_V8CGI_SQLITE_LIB)

clean:
	$(RM) $(ALL_OBJECTS) $(TEST_SOURCES) $(ALL_TEST_SCRIPTS)

$(TEST_SOURCES): t/001_model_update.t t/002_db.t t/003_is_array.t t/004_put.t t/005_sql.t t/006_string.t 
	$(T) t

test_script_v8cgi_sqlite: $(V8_V8CGI_SQLITE_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(V8_V8CGI_SQLITE_LIB) ../js/sqlite_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_V8_V8CGI_SQLITE)

test_script_v8cgi_mysql: $(V8_V8CGI_MYSQL_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(V8_V8CGI_MYSQL_LIB) ../js/mysql_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_V8_V8CGI_MYSQL)

test_v8_v8cgi_sqlite: test_script_v8cgi_sqlite
	$(V8_V8CGI_BIN)../coffee/$(TEST_SCRIPT_V8_V8CGI_SQLITE)

test_v8_v8cgi_mysql: test_script_v8cgi_mysql	
	$(V8_V8CGI_BIN)../coffee/$(TEST_SCRIPT_V8_V8CGI_MYSQL)

test: test_v8_v8cgi_mysql test_v8_v8cgi_sqlite

all_libs: $(ALL_LIBS)

