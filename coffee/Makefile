#MINIFY=| perl -MJavaScript::Minifier -e"print JavaScript::Minifier::minify(input=>*STDIN)"

V8CGI_ROOT=c:\Progra~1\v8cgi\ 
V8CGI_BIN=$(V8CGI_ROOT)v8cgi -c $(V8CGI_ROOT)v8cgi.conf ../tools/

CSC=$(V8CGI_BIN)csc.js 
CSL=$(V8CGI_BIN)csl.js 
RM=$(V8CGI_BIN)rm.js 

COMMON_SOURCES=eludia.coffee db.coffee model.coffee wish.coffee wish/table_data.coffee wish/table_columns.coffee wish/table_keys.coffee
SQLITE_SOURCES=db/sqlite.coffee db/sqlite/wish/table_columns.coffee db/sqlite/wish/table_keys.coffee

V8CGI_SQLITE_SOURCES=$(COMMON_SOURCES) $(SQLITE_SOURCES) js/v8.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/sqlite.coffee
V8CGI_SQLITE_OBJECTS=$(V8CGI_SQLITE_SOURCES:.coffee=.js)
V8CGI_SQLITE_LIB=../js/v8cgi_sqlite.jsl

V8CGI_MYSQL_SOURCES=$(COMMON_SOURCES) db/sqlite.coffee js/v8.coffee js/v8cgi/mysql_sqlite.coffee js/v8cgi/mysql.coffee
V8CGI_MYSQL_OBJECTS=$(V8CGI_MYSQL_SOURCES:.coffee=.js)
V8CGI_MYSQL_LIB=../js/v8cgi_mysql.jsl

TEST_SOURCES=t/t.coffee
TEST_OBJECTS=$(TEST_SOURCES:.coffee=.js)
TEST_SCRIPT=__test.js
TEST_LIB=$(V8CGI_SQLITE_LIB)

ALL_LIBS=$(V8CGI_SQLITE_LIB) $(V8CGI_MYSQL_LIB)
ALL_OBJECTS=$(V8CGI_SQLITE_OBJECTS) $(V8CGI_MYSQL_OBJECTS) $(TEST_OBJECTS)

.SUFFIXES: .js .coffee

.coffee.js:
	$(CSC) $< > $@

all: all_libs

$(V8CGI_MYSQL_LIB):  $(V8CGI_MYSQL_OBJECTS)
	$(CSL) $(V8CGI_MYSQL_OBJECTS) $(MINIFY) > $(V8CGI_MYSQL_LIB)

$(V8CGI_SQLITE_LIB):  $(V8CGI_SQLITE_OBJECTS)
	$(CSL) $(V8CGI_SQLITE_OBJECTS)$(MINIFY) > $(V8CGI_SQLITE_LIB)

clean:
	$(RM) $(ALL_OBJECTS)

test_script: $(TEST_LIB) $(TEST_OBJECTS)
	$(CSL) $(TEST_LIB) $(TEST_OBJECTS) > $(TEST_SCRIPT)

test: test_script
	$(V8CGI_BIN)../coffee/$(TEST_SCRIPT)
#	$(RM) $(TEST_SCRIPT)

all_libs: $(ALL_LIBS)

