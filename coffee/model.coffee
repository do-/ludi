class Model

    constructor: () ->
        @tables          = {}
        @default_columns = {}
        @types =
            ref:
                type     : 'INTEGER'
            checkbox:
                type     : 'INTEGER'
                nullable : false
                default  : 0
            radio:
                type     : 'INTEGER'
                nullable : false
                default  : -1
            money:
                type     : 'DECIMAL'
                size     : 10
                scale    : 2

    pk: (name) ->
        columns = @tables[name].columns
        for i of columns
            column = columns[i]
            return column.name if column.pk

    assert: (options) ->
        options ?= {}
        for table_name of @tables
            options.table = table_name
            table         = @tables[table_name]
            columns       = table.columns
            col_list      = []
            for i of columns
                continue unless (col = columns[i])?
                col_list.push col
            sum = (new WishTableColumns col_list, {debug:options.debug, table:table_name}).realize()
            keys     = table.keys
            key_list = ({name:i, parts:keys[i]} for i of keys)
            sum += (new WishTableKeys key_list,    {debug:options.debug, table:table_name}).realize()
            sum += (new WishTableData table.data,  {debug:options.debug, table:table_name}).realize()
            return sum

    set: (name, table) ->
        t = (@tables[name] ?= {columns: {}, keys: {}, data: []})
        def t.columns, @default_columns
        for name of table.columns
            t.columns[name] = @parse_column name, table.columns[name]
        def t.keys, table.keys
        def t.data, table.data

    parse_column: (name, src) ->
        if src is undefined
            return undefined
        if typeof src is 'object'
            src.name = name
            return src
        column      = {name: name}
        type_name   = src.match(/^\s*(\w+)/)?[1]
        type_name  ?= 'ref'
        type        = (@types[type_name] ?= {type: type_name.toUpperCase()})
        def column, type
        if m = src.match(/\-\>\s*(\w+)(\!?)/)
            column.ref      = m[1]
            column.nullable = not m[2]
        if m = src.match(/\'(.*)\'/)
            column.default  = m[1]
        if m = src.match(/\(\s*(\d+)/)
            column.size     = m[1]
        if m = src.match(/\,\s*(\d+)\s*\)/)
            column.scale    = m[1]
        if m = src.match(/\#(.*)/)
            column.comment  = m[1]
        column

model = new Model