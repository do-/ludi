WishTableKeys::explore_existing = () ->
    len = 1 + @options.table.length
    db.do("SHOW KEYS FROM " + @options.table, (i) =>
        i.key_name ?= i.index_name
        return if i.key_name is 'PRIMARY'
        part  = i.column_name
        part += "(#{i.sub_part})" if i.sub_part?
        name  = i.key_name.toLowerCase().substr len
        (@existing[name] ?= {name: name, global_name: @options.table + '_' + name, parts: []}).parts.push part
    )
    for name of @existing
        @existing[name].parts += ""
