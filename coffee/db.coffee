class Db

    _set       : (record, result) -> record
    _append_s  : (record, result) -> result += ',' + record
    _append_a  : (record, result) -> result.push record; result

    int     : (qp)           -> parseInt(@scalar qp)
    float   : (qp)           -> parseFloat(@scalar qp)
    string  : (qp)           -> new String @scalar qp
    one     : (qp, callback) -> @do  qp, @_set, {one: true, row: callback}
    scalar  : (qp)           -> @one qp, @_get_scalar
    array   : (qp)           -> @one qp, @_get_array
    object  : (qp)           -> @one qp, @_get_hash_getter
    ids     : (qp)           -> @do  qp, @_append_s, {init: '-1', row: @_get_scalar}
    column  : (qp)           -> @do  qp, @_append_a, {init:   [], row: @_get_scalar}
    arrays  : (qp)           -> @do  qp, @_append_a, {init:   [], row: @_get_array}
    objects : (qp, idx)      -> @do  qp, @_append_a, {init:   [], row: @_get_object, idx: idx}

Db::insert_id = (table, record) ->
    @insert(table, record)
    @_insertId()

Db::clone = (table, record, over) ->
    pk = model.pk table
    over[pk] = undefined;
    record[i] = over[i] for i of over
    record[pk] = @insert_id table, record
    return record

Db::insert = (table, record) ->
    fields = []
    places = []
    values = []
    for i of record
        fields.push i
        places.push '?'
        values.push if typeof record[i] is 'object' then record[i][0] else record[i]
    @do ["INSERT INTO #{table} (#{fields}) VALUES (#{places})", values]

Db::get_id = (table, record, key) ->
    pk     = model.pk table
    key   ?= pk
    key    = [key] unless typeof key is 'object'
    fields = []
    params = []
    for i in key
        fields.push " AND #{i}=?"
        params.push record[i]
    return @insert_id(table, record) unless (id = db.scalar(["SELECT #{pk} FROM #{table} WHERE 1=1#{fields}", params]))
    mandatory = {}
    for i of record
        value = record[i]
        continue if typeof value is 'object'
        mandatory[i] = value
    for i in key
        mandatory[i] = undefined
    mandatory_fields = (i for i of mandatory)
    return id if mandatory_fields.length == 0
    o = db.object ["SELECT #{mandatory_fields} FROM #{table} WHERE #{pk} = ?", id]
    fields = []
    params = []
    for i of mandatory
        v = mandatory[i]
        continue if v is undefined
        v = '' + v if v?
        continue if o[i] is v
        fields.push "#{i}=?"
        params.push v
    return id if fields.length == 0
    params.push id
    db.do ["UPDATE #{table} SET #{fields} WHERE #{pk} = ?", params]
    return id

Db::delete = (table, record) ->
    pk = model.pk table
    id = if typeof record is 'object' then record[pk] else record
    @do ["DELETE FROM #{table} WHERE #{pk}=?", id]

Db::update = (table, record) ->
    fields = []
    places = []
    values = []
    pk = model.pk table
    for i of record
        continue if i is pk
        fields.push "#{i}=?"
        values.push record[i]
    values.push record[pk]
    @do ["UPDATE #{table} SET #{fields} WHERE #{pk}=?", values]

Db::_get_hash_getter  = (i, fieldNames) ->
    c = ((@_code_cache ?= {})._get_hash_getter ?= {});
    c[json fieldNames] ?= db._gen_hash_getter fieldNames

Db::_gen_hash_getter  = (fieldNames) ->
    h = {}; i = 0
    for fieldName in fieldNames
        parts = fieldName.split '.'
        last  = parts.pop 0
        r = h
        r = (r[part] ?= {}) for part in parts
        r[last] = i++
    code = (json h).replace /\:(\d+)/g, ':' + db._gen_hash_accessor
    `var f; eval ('f = function (rs){return ' + code + '}');`
    f

db = new Db;
