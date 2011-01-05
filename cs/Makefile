V8CGI_ROOT=c:\Progra~1\v8cgi\ 
V8CGI_BIN=$(V8CGI_ROOT)v8cgi -c $(V8CGI_ROOT)v8cgi.conf ../tools/

CSC=$(V8CGI_BIN)csc.js 
CSL=$(V8CGI_BIN)csl.js 
RM=$(V8CGI_BIN)rm.js 

COMMON_SOURCES=eludia.cs db.cs wish.cs wish/table_data.cs

V8CGI_SQLITE_SOURCES=$(COMMON_SOURCES) db/sqlite.cs js/v8.cs js/v8cgi/sqlite.cs
V8CGI_SQLITE_OBJECTS=$(V8CGI_SQLITE_SOURCES:.cs=.js)
V8CGI_SQLITE_LIB=../js/v8cgi_sqlite.jsl

TEST_SOURCES=t/t.cs
TEST_OBJECTS=$(TEST_SOURCES:.cs=.js)
TEST_SCRIPT=__test.js
TEST_LIB=$(V8CGI_SQLITE_LIB)

ALL_LIBS=$(V8CGI_SQLITE_LIB)
ALL_OBJECTS=$(V8CGI_SQLITE_OBJECTS) $(TEST_OBJECTS)

.SUFFIXES: .js .cs

.cs.js:
	$(CSC) $< > $@

$(V8CGI_SQLITE_LIB):  $(V8CGI_SQLITE_OBJECTS)
	$(CSL) $(V8CGI_SQLITE_OBJECTS) > $(V8CGI_SQLITE_LIB)

clean:
	$(RM) $(ALL_OBJECTS)

test_script: $(TEST_LIB) $(TEST_OBJECTS)
	$(CSL) $(TEST_LIB) $(TEST_OBJECTS) > $(TEST_SCRIPT)

test: test_script
	$(V8CGI_BIN)../cs/$(TEST_SCRIPT)
	$(RM) $(TEST_SCRIPT)

all_libs: $(ALL_LIBS)

all: all_libs