MS_IIS_MYSQL_SOURCES=$(COMMON_SOURCES) $(MYSQL_SOURCES) js/ms.coffee js/ms/mysql.coffee
MS_IIS_MYSQL_OBJECTS=$(MS_IIS_MYSQL_SOURCES:.coffee=.js)
MS_IIS_MYSQL_LIB=../compiled/ludi_ms_iis_mysql_lib.js

TEST_SCRIPT_MS_IIS_MYSQL=t/test_ms_iis_mysql.js

$(MS_IIS_MYSQL_LIB):  $(MS_IIS_MYSQL_OBJECTS)
	$(CSL) ../ext/json2.js $(MS_IIS_MYSQL_OBJECTS)$(MINIFY) > $(MS_IIS_MYSQL_LIB)

test_script_ms_iis_mysql: $(MS_IIS_MYSQL_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(MS_IIS_MYSQL_LIB) ../local/mysql_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_MS_IIS_MYSQL)

ASP=../compiled/default.asp

test_ms_iis_mysql: test_script_ms_iis_mysql
	type ..\js\bra.asp > $(ASP)
	type t\test_ms_iis_mysql.js >> $(ASP)
	type ..\js\ket.asp >> $(ASP)
	$(CHROME_BROWSER) http://127.0.0.1:8000
