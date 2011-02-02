#MINIFY=| perl -MJavaScript::Minifier -e"print JavaScript::Minifier::minify(input=>*STDIN)"

V8CGI_ROOT=c:\Progra~1\v8cgi\ 
V8CGI_BIN=$(V8CGI_ROOT)v8cgi -c $(V8CGI_ROOT)v8cgi.conf ../tools/

CSC=$(V8CGI_BIN)csc.js 
CSL=$(V8CGI_BIN)csl.js 
RM=$(V8CGI_BIN)rm.js 
T=$(V8CGI_BIN)t.js 

COMMON_SOURCES=ludi.coffee sprintf.coffee log.coffee db.coffee sql.coffee model.coffee wish.coffee wish/table_data.coffee wish/table_data_rooted.coffee wish/table_columns.coffee wish/table_keys.coffee
SQLITE_SOURCES=db/sqlite.coffee db/sqlite/wish/table_columns.coffee db/sqlite/wish/table_keys.coffee

V8CGI_SQLITE_SOURCES=$(COMMON_SOURCES) $(SQLITE_SOURCES) js/v8.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/sqlite.coffee
V8CGI_SQLITE_OBJECTS=$(V8CGI_SQLITE_SOURCES:.coffee=.js)
V8CGI_SQLITE_LIB=../js/v8cgi_sqlite.jsl

V8CGI_MYSQL_SOURCES=$(COMMON_SOURCES) db/sqlite.coffee js/v8.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/mysql.coffee
V8CGI_MYSQL_OBJECTS=$(V8CGI_MYSQL_SOURCES:.coffee=.js)
V8CGI_MYSQL_LIB=../js/v8cgi_mysql.jsl

TEST_SOURCES=t/t.coffee
TEST_OBJECTS=$(TEST_SOURCES:.coffee=.js)
TEST_SCRIPT=t/test.js
TEST_LIB=$(V8CGI_SQLITE_LIB)

ALL_LIBS=$(V8CGI_SQLITE_LIB) $(V8CGI_MYSQL_LIB)
ALL_OBJECTS=$(V8CGI_SQLITE_OBJECTS) $(V8CGI_MYSQL_OBJECTS) $(TEST_OBJECTS)

.SUFFIXES: .js .coffee .t

.coffee.js:
	$(CSC) $< > $@

all: all_libs

$(V8CGI_MYSQL_LIB):  $(V8CGI_MYSQL_OBJECTS)
	$(CSL) $(V8CGI_MYSQL_OBJECTS) $(MINIFY) > $(V8CGI_MYSQL_LIB)

$(V8CGI_SQLITE_LIB):  $(V8CGI_SQLITE_OBJECTS)
	$(CSL) $(V8CGI_SQLITE_OBJECTS)$(MINIFY) > $(V8CGI_SQLITE_LIB)

clean:
	$(RM) $(ALL_OBJECTS) $(TEST_SOURCES) $(TEST_SCRIPT)

$(TEST_SOURCES): t/001_model_update.t t/002_db.t t/003_is_array.t t/004_put.t t/005_sql.t t/006_string.t 
	$(T) t

test_script: $(TEST_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(TEST_LIB) $(TEST_OBJECTS) > $(TEST_SCRIPT)

test: test_script
	$(V8CGI_BIN)../coffee/$(TEST_SCRIPT)

all_libs: $(ALL_LIBS)

