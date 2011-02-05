_db = google.gears.factory.create 'beta.database'

Db::__connect  = (o) -> _db.open o.name

Db::_get_scalar  = (i) -> i.field 0
Db::_get_array   = (i) ->
    i.field j for j in [0..i.fieldCount()-1]
Db::_get_object  = (i) ->
    db._get_hash_getter i, db._last_field_names

Db::prepare = (sql) -> sql

Db::execute = (sql, params) ->
    return if sql.match /^\s*VACUUM/i
    log.on 'db.execute', {label: sql + ' ' + json params}
    for i in [0..params.length]
        continue unless is_array params[i]
        params[i] = params[i][0]
    result = _db.execute sql, params
    log.off 'db.execute'
    return result

Db::_insertId = () -> _db.lastInsertRowId

Db::do = (qp, callback, options) ->
    log.on 'db.do', {label: json qp}
    @._gen_hash_accessor ?= 'rs.field($1)'
    options ?= {}
    result = options.init
    [query, params] = @qp qp
    prepared_query = @prepare query
    params ?= []
    params = [params] unless is_array params
    param_list = if params.length > 0 and is_array params[0] then params else [params]
    for p in param_list
        result = @_do prepared_query, p, result, callback, options
    log.off 'db.do'
    return result

Db::_do = (prepared_query, params, result, callback, options) ->

    db._last_rs = rs = @execute prepared_query, params

    return unless callback?

    db._last_field_names = fieldNames = (rs.fieldName(i).toLowerCase() for i in [0..rs.fieldCount()-1]);

    options.row ?= @_get_object

    if options.idx?
        result.idx = {}
        options.idxidx = fieldNames.indexOf options.idx

    while rs.isValidRow()

        row = options.row rs, fieldNames

        if typeof row is 'function'
            options.row = row
            row = options.row rs

        if options.idx?
            result.idx[i[options.idxidx]] = row

        result = callback row, result

        break if options.one

        rs.next();

    rs.close();

    return result
