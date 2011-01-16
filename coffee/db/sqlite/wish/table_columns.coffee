
WishTableColumns::explore_existing = () ->

    re = ///
        (
            \w+                             # name
            \s+
            \w+                             # type
            (?:\s*\(\s*
                \d+
                (?:\s*
                    \,\s*\d+\s*
                )?
                \s*
            \))?                            # size
            (?:
                \s*PRIMARY\s+KEY|
                \s*AUTOINCREMENT|
                \s*NOT\s+NULL
                \s*DEFAULT\s+(?:\d+|\'.*?\')
            )*
        )
    ///i

    fields = []

    sql = db.string(["SELECT sql FROM sqlite_master WHERE type = ? AND name = ?", ['table', @options.table]])
    sql ?= ''

    for i in sql.replace(/CREATE\s+TABLE\s+\w+\s*\((.*)\)\s*$/mi, '$1').split(re)
        fields.push i if re.test i

    for field in fields

        m = field.match(///^\s*
            (\w+)\s+(\w+)
            (?:\s*\(
                \s*
                (\d+)
                (?:\s*\,\s*(\d+)\s*)?
                \s*
            \))?
        ///)

        item =
            name         : m[1].toLowerCase()
            type         : m[2].toUpperCase()
            size         : m[3]
            scale        : m[4]
            pk           : (/PRIMARY\s+KEY/i).test field
            autoincrement: (/AUTOINCREMENT/i).test field
            default      : eval((field.match(/DEFAULT\s+(\d+|\'.*?\')/i))?[1])
            nullable     : not ((/NOT\s+NULL/i).test field)

        @existing[item.name] = item
        @adjust_field_options (item)

WishTableColumns::clarify_demands = (item) ->
    @adjust_field_options (item)
    item.type = 'INTEGER' if item.type.match(/INT/i)
    item.ref = undefined
    item.comment = undefined

WishTableColumns::add_sql = (item) ->
    item.sql = "#{item.name} #{item.type}"
    if item.size?
        item.sql += " (#{item.size}"
        if item.scale?
            item.sql += ", #{item.scale}"
        item.sql += ")"
    if item.pk
        item.sql += " PRIMARY KEY"
    if item.autoincrement
        item.sql += " AUTOINCREMENT"
    if (not item.nullable) and (not item.autoincrement)
        item.sql += " NOT NULL"
    if item.default?
        item.sql += " DEFAULT '#{item.default}'"

WishTableColumns::schedule_modifications = (old, young) ->
    @todo.create.push young

WishTableColumns::create = (items) ->

    existed = (i for i of @existing)

    if existed.length > 0
        keys = db.column ["SELECT sql from sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL", @options.table]
        db.do "CREATE TEMP TABLE __buffer AS SELECT * FROM #{@options.table}"
        db.do "DROP TABLE #{@options.table}"

    names = []; defs = []; ts = []; idx = {}

    for item in items
        @add_sql  item
        ts.push   item.name if item.type is 'TIMESTAMP'
        defs.push item.sql
        idx[item.name] = item

    for name of @existing
        continue if idx[name]?
        item = @existing[name]
        @add_sql  item
        ts.push   item.name if item.type is 'TIMESTAMP'
        defs.push item.sql
        idx[item.name] = item

    db.do "CREATE TABLE #{@options.table} (#{defs})";

    if existed.length > 0
        exprs =
            for name in existed
                def = idx[name]?.default
                if def? then "IFNULL(#{name}, '#{def}')" else name
        db.do "INSERT INTO  #{@options.table} (#{existed}) SELECT #{exprs} FROM __buffer";
        db.do "DROP TABLE __buffer";
        db.do sql for sql in keys

    for name in ts
        for event in ['insert', 'update']
            db.do """
                CREATE TRIGGER #{@options.table}_#{name}_timestamp_#{event}_trigger AFTER #{event} ON #{@options.table}
                    BEGIN
                        UPDATE #{@options.table} SET #{name} = NOW() WHERE oid = new.oid;
                    END;
            """

    db.do "VACUUM";