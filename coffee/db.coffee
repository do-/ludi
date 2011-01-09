class Db

    _set       : (record, result) -> record
    _append_s  : (record, result) -> result += ',' + record
    _append_a  : (record, result) -> result.push record; result

    one     : (qp, callback) -> @do  qp, @_set, {one: true, row: callback}
    scalar  : (qp)           -> @one qp, @_get_scalar
    array   : (qp)           -> @one qp, @_get_array
    object  : (qp)           -> @one qp, @_get_hash_getter
    ids     : (qp)           -> @do  qp, @_append_s, {init: '-1', row: @_get_scalar}
    column  : (qp)           -> @do  qp, @_append_a, {init:   [], row: @_get_scalar}
    arrays  : (qp)           -> @do  qp, @_append_a, {init:   [], row: @_get_array}
    objects : (qp, idx)      -> @do  qp, @_append_a, {init:   [], row: @_get_object, idx: idx}

Db::insert = (table, record) ->
    fields = []
    places = []
    values = []
    for i of record
        fields.push i
        places.push '?'
        values.push record[i]
    @do ["INSERT INTO #{table} (#{fields}) VALUES (#{places})", values]

Db::_get_hash_getter  = (i, fieldNames) ->
    c = ((@_code_cache ?= {})._get_hash_getter ?= {});
    c[Dumper fieldNames] ?= db._gen_hash_getter fieldNames

Db::_gen_hash_getter  = (fieldNames) ->
    h = {}; i = 0
    for fieldName in fieldNames
        parts = fieldName.split '.'
        last  = parts.pop 0
        r = h
        r = (r[part] ?= {}) for part in parts
        r[last] = i++
    code = (Dumper h).replace /\:(\d+)/g, ':' + db._gen_hash_accessor
    `var f; eval ('f = function (rs){return ' + code + '}');`
    f

db = new Db;
