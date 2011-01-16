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

Db::make_param_batch = (items, cols) ->
    batch = []
    for item in items
        p = []
        for col in cols
            p.push item[col]
        batch.push p
    return batch

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

Db::insert = (table, data) ->
    (new DbOperatorInsert(table, data)).do()

Db::update = (table, data) ->
    (new DbOperatorUpdate(table, data)).do()

Db::delete = (table, data) ->
    if typeof data isnt 'object'
        id   = data
        data = {}
        data[model.pk table] = id
    (new DbOperatorDelete(table, data)).do()

Db::put = (table, records, key, root) ->
    (new WishTableDataRooted(records, {table: table, key:key, root:root})).realize()

db = new Db;

class DbOperator

    constructor: (@table, @data) ->
        @items = if is_array @data then @data else [@data]
        return if data.length is 0
        item   = @items[0]
        @pk    = model.pk @table
        @cols  = []
        has_pk  = false
        for i of item
            if i is @pk
                has_pk = true
                continue
            @cols.push i
        if has_pk
            @cols.push @pk

    do: () ->
        return if @items.length == 0
        sql    = @sql()
        params = db.make_param_batch @items, @cols
        db.do [sql, params]

class DbOperatorInsert extends DbOperator

    sql: () ->
        n = []
        q = []
        for col in @cols
            n.push db.quote_name col
            q.push '?'
        "INSERT INTO #{@table} (#{n}) VALUES (#{q})"

class DbOperatorUpdate extends DbOperator

    sql: () ->
        throw "PK is not set" unless @cols[@cols.length - 1] is @pk
        @cols.pop()
        n = (db.quote_name(col) + '=?' for col in @cols)
        @cols.push @pk
        "UPDATE #{@table} SET #{n} WHERE #{db.quote_name @pk}=?"

class DbOperatorDelete extends DbOperator

    sql: () ->
        @cols = [@pk]
        "DELETE FROM #{@table} WHERE #{db.quote_name @pk}=?"