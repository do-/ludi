String.prototype.__original_split = String.prototype.split
String::split = (re) ->
    src = re.source
    return @.__original_split re unless src?.match /\(/
    result = [];
    src = '(.*?)' + src
    re2 = new RegExp src
    s = @
    while true
        m = s.match re2
        unless m?
            result.push s if s.length > 0
            return result
        result.push m[1]
        result.push m[2]
        s = s.substr m[1].length + m[2].length

print  = (s) -> Response.Write s

Db::_get_scalar  = (i) -> db.__s i, 0
Db::_get_array   = (i) ->
    db.__s i, j for j in [0..i.Fields.Count-1]
Db::_get_object  = (i) ->
    db._get_hash_getter i, db._last_field_names

Db::prepare = (sql) ->
    ps = Server.CreateObject ("ADODB.Command");
    ps.ActiveConnection = _db
    ps.CommandText = sql
    try
        ps.Prepared = true
    catch e
        0
    ps

Db::execute = (ps, params) ->
    log.on 'db.execute', {label: json params}
    if params.length > 0
        if ps.Parameters.Count == 0
            for i in [1..params.length]
                ps.Parameters.Append ps.CreateParameter
        for i in [0..params.length-1]
            v = params[i]
            v = v[0] if is_array v
            ps.Parameters.Item(i).Value = v
    result = Server.CreateObject "ADODB.Recordset"
    result = ps.Execute()
    log.off 'db.execute'
    return result

Db::__s = (rs, i) ->
    v = rs.Fields(i).Value
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

Db::_close = (things...) ->
    for i in things
        i.Close() if i.State is 1
        i = null

Db::_do = (prepared_query, params, result, callback, options) ->

    db._last_rs = rs = @execute prepared_query, params

    return @_close(rs, prepared_query) unless callback?

    db._last_field_names = fieldNames = (""+rs.Fields.Item(i).Name.toLowerCase() for i in [0..rs.Fields.Count-1]);

    options.row ?= @_get_object

    if options.idx?
        result.idx = {}
        options.idxidx = fieldNames.indexOf options.idx

    until rs.EOF

        row = options.row rs, fieldNames

        if typeof row is 'function'
            options.row = row
            row = options.row rs

        if options.idx?
            result.idx[i[options.idxidx]] = row

        result = callback row, result

        break if options.one

        rs.MoveNext()

    @_close(rs, prepared_query);

    return result