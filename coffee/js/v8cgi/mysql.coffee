MySQL = (require("mysql")).MySQL;

_db = new MySQL

Db::__connect  = (o) ->
    _db.connect o.host, o.user, o.password, o.db

Db::escape  = (sql) ->
    return 'NULL' if sql is null
    "'" + (_db.escape sql) + "'"