WishTableColumns::clarify_demands = (item) ->
    @adjust_field_options (item)
    item.ref      = undefined
    item.type     = 'INT' if item.type is 'INTEGER'
    item.nullable = false if item.pk
    item.default ?= (if item.type.match(/(CHAR|TEXT)/) then '' else 0)
    item.default  = undefined if item.pk

WishTableColumns::add_sql = (item) ->
    item.sql = "#{item.name} #{@gen_sql(item)}"

WishTableColumns::gen_sql = (item) ->
    sql = item.type
    if item.size?
        sql += "(#{item.size}"
        sql += ",#{item.scale}" if item.scale?
        sql += ")"
    sql += " PRIMARY KEY"               if item.pk
    sql += " AUTO_INCREMENT"            if item.autoincrement
    sql += " NOT NULL"                  if (not item.nullable) and (not item.autoincrement)
    sql += " DEFAULT '#{item.default}'" if item.default?
    sql

WishTableColumns::schedule_modifications = (old, young) ->
    (@todo.modify ?= []).push young

WishTableColumns::def_list = (verb, items) ->
    for item in items
        @add_sql  item
        verb + ' ' + item.sql

WishTableColumns::create = (items) ->
    is_create = json(@existing)is '{}'
    defs      = @def_list((if is_create then '' else 'ADD'), items)
    db.do(if is_create then "CREATE TABLE #{@options.table} (#{defs})" else "ALTER TABLE #{@options.table} #{defs}")

WishTableColumns::modify = (items) ->
    for item in items
        @add_sql  item
        try
            db.do "ALTER TABLE #{@options.table} MODIFY #{item.sql}"
        catch e
            db.do "ALTER TABLE #{@options.table} DROP PRIMARY KEY" if @existing[item.name].pk
            pk = item.pk
            delete item.pk
            def = @gen_sql item
            db.do "ALTER TABLE #{@options.table} ADD _ #{def}"
            db.do "UPDATE #{@options.table} SET _ = #{item.name}"
            db.do "ALTER TABLE #{@options.table} DROP #{item.name}"
            db.do "ALTER TABLE #{@options.table} CHANGE _ #{item.name} #{def}"
            db.do "ALTER TABLE #{@options.table} ADD PRIMARY KEY (#{item.name})" if pk

WishTableColumns::explore_existing = () ->
    return {} if db.objects("SHOW TABLES LIKE '#{@options.table}'").length == 0
    pk = db.object("SHOW KEYS FROM #{@options.table} WHERE Key_name = 'PRIMARY'")?.column_name;
    db.do(["""
            SELECT
                column_name
                , data_type
                , column_default
                , column_comment
                , is_nullable
                , numeric_precision
                , numeric_scale
                , character_maximum_length
                , extra
            FROM
                information_schema.columns
            WHERE
                table_schema=database()
                AND table_name = ?
        """, @options.table],
        (i) =>
            item =
                name         : i.column_name.toLowerCase()
                type         : i.data_type.toUpperCase()
                size         : (i.numeric_precision ?= 0) + (i.character_maximum_length ?= 0)
                scale        : i.numeric_scale
                pk           : i.column_name is pk
                autoincrement: i.extra is 'auto_increment'
                default      : i.column_default
                nullable     : i.is_nullable is 'YES'
                comment      : i.column_comment
            @existing[item.name] = item
            @adjust_field_options (item)
    )
