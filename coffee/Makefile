include local.mk 

COMMON_SOURCES=ludi.coffee sprintf.coffee log.coffee db.coffee sql.coffee model.coffee wish.coffee wish/table_data.coffee wish/table_data_rooted.coffee wish/table_columns.coffee wish/table_keys.coffee testing.coffee
SQLITE_SOURCES=db/sqlite.coffee db/sqlite/wish/table_columns.coffee db/sqlite/wish/table_keys.coffee
MYSQL_SOURCES=db/mysql.coffee db/mysql/wish/table_columns.coffee db/mysql/wish/table_keys.coffee

TEST_SOURCES=t/t.coffee
TEST_OBJECTS=$(TEST_SOURCES:.coffee=.js)

.SUFFIXES: .js .coffee .t

include build_node.mk

include v8_v8cgi_sqlite.mk 
include v8_v8cgi_mysql.mk 
include v8_chrome_sqlite.mk
include rhino_standalone_mysql.mk
include ms_iis_mysql.mk
include monkey_ff_sqlite.mk

ALL_TEST_SCRIPTS=$(TEST_SCRIPT_V8_CHROME_SQLITE) $(TEST_SCRIPT_V8_V8CGI_SQLITE) $(TEST_SCRIPT_V8_V8CGI_MYSQL) $(TEST_SCRIPT_RHINO_STANDALONE_MYSQL) $(TEST_SCRIPT_IIS_MYSQL_LIB) $(TEST_SCRIPT_MONKEY_FF_SQLITE)
ALL_LIBS=$(V8_CHROME_SQLITE_LIB) $(V8_V8CGI_SQLITE_LIB) $(V8_V8CGI_MYSQL_LIB) $(RHINO_STANDALONE_MYSQL_LIB) $(MS_IIS_MYSQL_LIB) $(MONKEY_FF_SQLITE_LIB)
ALL_OBJECTS=$(V8_CHROME_SQLITE_OBJECTS) $(V8_V8CGI_SQLITE_OBJECTS) $(V8_V8CGI_MYSQL_OBJECTS) $(TEST_OBJECTS) $(RHINO_STANDALONE_MYSQL_OBJECTS) $(MS_IIS_MYSQL_OBJECTS) $(MONKEY_FF_SQLITE_OBJECTS)

all_libs: $(ALL_LIBS)

all: all_libs

clean:
	$(RM) $(ALL_OBJECTS) $(TEST_SOURCES) $(ALL_TEST_SCRIPTS)

$(TEST_SOURCES): t/001_model_update.t t/002_db.t t/003_is_array.t t/004_put.t t/005_sql.t t/006_string.t 
	$(T) t

test: test_rhino_standalone_mysql test_v8_v8cgi_mysql test_v8_v8cgi_sqlite test_v8_chrome_sqlite test_ms_iis_mysql test_monkey_ff_sqlite
