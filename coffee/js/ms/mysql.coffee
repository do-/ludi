_db = null;

Db::__connect  = (o) ->
    _db = Server.CreateObject "ADODB.Connection"
    _db.Open "Provider=MSDASQL.1;Password=#{o.password};Persist Security Info=True;User ID=#{o.user};Data Source=#{o.db}"

Db::_insertId = () -> db.integer "SELECT LAST_INSERT_ID()"