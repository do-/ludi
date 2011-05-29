SQLite = (require 'sqlite').SQLite

_db = new SQLite

Db::__connect  = (o) -> _db.open o.file
