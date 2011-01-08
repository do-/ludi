SQLite = (require 'sqlite').SQLite

_db = new SQLite
_db.open Config.db.file
