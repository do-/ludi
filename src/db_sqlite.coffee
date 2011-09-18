
Db::ping = ()   ->
    try
        return 1 == db.integer "SELECT 1"
    catch e
        return 0

Db::escape = (s)   ->
    return 'NULL' unless s?
    "'" + (('' + s).replace /\'/i, "''") + "'"

Db::quote_name = (s)   ->
    '"' + s + '"'