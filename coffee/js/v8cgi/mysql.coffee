MySQL = (require("mysql")).MySQL;

_db = new MySQL
_db.connect Config.db.host, Config.db.user, Config.db.password, Config.db.db

Db::escape  = (sql) ->
    return 'NULL' if sql is null
    "'" + (_db.escape sql) + "'"