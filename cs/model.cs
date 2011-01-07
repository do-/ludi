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

    set: (name, table) ->
        t = (@tables[name] ?= {columns: {}, keys: {}, data: []})
        def t.columns, @default_columns
        for name of table.columns
            t.columns[name] = @parse_column name, table.columns[name]
        def t.keys, table.keys

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