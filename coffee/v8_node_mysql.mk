V8_NODE_MYSQL_SOURCES=$(COMMON_SOURCES) $(MYSQL_SOURCES) js/v8_node.coffee js/node/mysql.coffee
V8_NODE_MYSQL_OBJECTS=$(V8_NODE_MYSQL_SOURCES:.coffee=.js)
V8_NODE_MYSQL_LIB=../js/ludi_v8_node_mysql.js

TEST_SCRIPT_V8_NODE_MYSQL=t/test_v8_node_mysql.js

$(V8_NODE_MYSQL_LIB):  $(V8_NODE_MYSQL_OBJECTS)
	$(CSL) $(V8_NODE_MYSQL_OBJECTS) $(MINIFY) > $(V8_NODE_MYSQL_LIB)

test_script_v8_node_mysql: $(V8_NODE_MYSQL_LIB) $(TEST_SOURCES) $(TEST_OBJECTS)
	$(CSL) $(V8_NODE_MYSQL_LIB) ../js/mysql_connect.js $(TEST_OBJECTS) > $(TEST_SCRIPT_V8_NODE_MYSQL)

test_v8_node_mysql: test_script_v8_node_mysql	
	$(V8_NODE_BIN)../coffee/$(TEST_SCRIPT_V8_NODE_MYSQL)
