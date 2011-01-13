class Model

    constructor: () ->
        @tables          = {}
        @default         = {columns: {}, keys: {}}
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
            pk = model.pk table_name
            data     = table.data
            data_list = []
            for i of data
                item = data[i]
                continue unless item?
                item[pk] = i
                data_list.push item
            sum += (new WishTableData data_list,  {debug:options.debug, table:table_name}).realize()
            return sum

    set: (name, table) ->
        t = (@tables[name] ?= {columns: {}, keys: {}, data: []})
        def t.columns, @default.columns
        def t.columns, table.columns
        for n of t.columns
            column = t.columns[n]
            if column?
                t.columns[n] = @parse_column n, column
            else
                delete t.columns[n]
        def t.keys, @default.keys
        def t.keys, table.keys
        def t.data, table.data

    parse_column: (name, src) ->
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