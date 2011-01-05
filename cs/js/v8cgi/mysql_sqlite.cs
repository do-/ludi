Db::_get_scalar  = (i) -> i[0]
Db::_get_array   = (i) -> i
Db::_get_object  = (i) ->
    db._get_hash_getter i, db._last_rs.fetchNames 0

Db::prepare = (sql) -> sql.split '\?'

Db::execute = (qp) ->
    [query, params] = if typeof qp is 'object' then qp else [qp, []]
    params ?= []
    i = 0
    q = @prepare query
    sql = q.shift 0; sql += ((@escape params[i++]) + s) for s in q
    darn sql
    _db.query(sql)

Db::arrays = (qp) -> (@execute qp).fetchArrays 0

Db::do = (qp, callback, options) ->

    @._gen_hash_accessor ?= 'rs[$1]'

    options ?= {}

    result = options.init

    db._last_rs = rs = @execute qp

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

    result
