print  = (s) -> Packages.java.lang.System.err.print s

Db::_get_scalar  = (i) -> db.__s i, 0
Db::_get_array   = (i) ->
    db.__s i, j for j in [0..i.getMetaData().getColumnCount()-1]
Db::_get_object  = (i) ->
    db._get_hash_getter i, db._last_field_names

Db::prepare = (sql) ->
    _db.prepareStatement sql

Db::execute = (ps, params) ->
    log.on 'db.execute', {label: json params}
    if params.length > 0
        for i in [1..params.length]
            v = params[i-1]
            v = v[0] if is_array v
            if v is null
                ps.setNull i, 12
            else
                ps.setString i, "" + v
    try
        result = ps.executeQuery()
    catch e
        result = ps.executeUpdate()
    log.off 'db.execute'
    return result

Db::__s = (rs, i) ->
    v = rs.getString i + 1
    return null unless v?
    "" + v

Db::do = (qp, callback, options) ->
    log.on 'db.do', {label: json qp}
    @._gen_hash_accessor ?= 'db.__s(rs,$1)'
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

    md = rs.getMetaData()

    db._last_field_names = fieldNames = (""+md.getColumnLabel(i+1).toLowerCase() for i in [0..md.getColumnCount()-1]);

    options.row ?= @_get_object

    if options.idx?
        result.idx = {}
        options.idxidx = fieldNames.indexOf options.idx

    while rs.next()

        row = options.row rs, fieldNames

        if typeof row is 'function'
            options.row = row
            row = options.row rs

        if options.idx?
            result.idx[i[options.idxidx]] = row

        result = callback row, result

        break if options.one

    rs.close();

    return result
