
Db::escape  = (s)   ->
    return 'NULL' unless s?
    "'" + (('' + s).replace /\'/i, "''") + "'"
