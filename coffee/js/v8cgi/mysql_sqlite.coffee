Db::_get_scalar  = (i) -> i[0]
Db::_get_array   = (i) -> i
Db::_get_object  = (i) ->
    db._get_hash_getter i, db._last_rs.fetchNames 0

Db::prepare = (sql) ->
    log.on 'db.prepare', {label: sql}
    parts  = (i.replace(/'/g, "\\'") for i in (""+sql).split '\?')
    code   = "'" + parts.shift() + "'"
    i = 0
    code  += "+db.escape(p[#{i++}])+'#{s}'" for s in parts
    code   = "f = function (p) {return (#{code})}"
    f = null
    eval code
    log.off 'db.prepare'
    return f

Db::execute = (prepared_query, params) ->
    log.on 'db.execute'
    sql = prepared_query params
    result = _db.query sql
    log.off 'db.execute', {label: sql}
    return result

Db::arrays = (qp) ->
    log.on 'db.arrays'
    [query, params] = @qp qp
    sql = @prepare query
    params ?= []
    result = (@.execute sql, params).fetchArrays()
    log.off 'db.arrays', {label: sql + " " + json params + " " + result.length}
    return result

Db::_insertId = () -> _db.insertId()

Db::do = (qp, callback, options) ->
    log.on 'db.do', {label: json qp}
    @._gen_hash_accessor ?= 'rs[$1]'
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

    options.row ?= @_get_object

    fieldNames = rs.fetchNames 0;

    if options.idx?
        result.idx = {}
        options.idxidx = fieldNames.indexOf options.idx

    for i in rs.fetchArrays 0

        row = options.row i, fieldNames

        if typeof row is 'function'
            options.row = row
            row = options.row i

        if options.idx?
            result.idx[i[options.idxidx]] = row

        result = callback row, result

        break if options.one

    return result
