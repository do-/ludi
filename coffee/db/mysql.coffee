
Db::escape = (s)   ->
    return 'NULL' unless s?
    "'" + (('' + s).replace /\'/i, "''") + "'"

Db::quote_name = (s)   ->
    '`' + s + '`'