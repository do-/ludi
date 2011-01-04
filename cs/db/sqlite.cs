
Db::escape  = (s)   -> "'" + (('' + s).replace /\'/i, "''") + "'"
