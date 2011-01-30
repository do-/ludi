
sql = (things...) ->
    (new Sql (things)).get()




class Sql

    constructor: (things) ->
        @re_long_identifier = /([a-z_][a-z_0-9]*(?:\.[a-z_][a-z_0-9]*)?)/;
        @re_short_identifier = /^([a-z_][a-z_0-9]*)$/;
        @tables = []
        @parameters = []
        @cols_by_aggr = [[],[]]
        last   = {}
        for thing in things
            if typeof thing is 'object'
                def last, thing
            else
                if ("" + thing).match(/^\d+$/)
                    last[model.pk last.TABLE] = thing
                else
                    last = {TABLE: thing}
                    @tables.push last

    set_default_columns: (table) ->
        return if table.COLUMNS?
        definition = model.tables[table.TABLE]
        throw "Table '#{table.TABLE}' is not defined in model" if !definition?
        table.COLUMNS = (i for i of definition.columns)

    globalize_expression: (table, local_expression) ->
        return local_expression if @tables.length is 1
        result = ''
        for i in local_expression.split @re_long_identifier
            result += if i.match @re_short_identifier then table.ALIAS + '.' + i else i
        return result

    parse_column: (table, i) ->
        return i if typeof i is 'object'
        col = {};
        m = i.match(/\s+AS\s+(\w+)\s*$/)
        if m?
            col.ALIAS = m[1]
            i = i.replace m[0], ''
        else
            col.ALIAS = table.COLUMN_ALIAS_PREFIX + i

        if table.IS_ROOT and !table.ORDER?
            col.ORDER = model.order table.TABLE, i

        col.EXPRESSION = @globalize_expression table, i
        col.SELECT = if col.EXPRESSION is col.ALIAS and col.ALIAS.match(/^\w+$/) then col.ALIAS else "#{col.EXPRESSION} #{db.quote_name(col.ALIAS)}"
        col.IS_AGGR = @is_aggr col.EXPRESSION
        @cols_by_aggr[col.IS_AGGR].push col
        return col

    is_aggr: (x) -> if x.match(/(COUNT|MIN|MAX|SUM|STDEV)/)? then 1 else 0

    adjust_join_for_vocabulary: (table, past_tables) ->
        return if table.ON?
        for i in past_tables
            ref = model.first_found_ref i.TABLE, table.TABLE
            if ref?
                table.ON = "#{i.ALIAS}.#{ref}=#{table.ALIAS}.#{model.pk(table.TABLE)}"
                return

    adjust_join_for_child: (table, past_tables) ->
        return if table.ON?
        for i in past_tables
            ref = model.first_found_ref table.TABLE, i.TABLE
            if ref?
                table.ON = "#{table.ALIAS}.#{ref}=#{i.ALIAS}.#{model.pk(i.TABLE)}"
                return

    adjust_join: (table, past_tables) ->

        table.FROM = if table.TABLE is table.ALIAS then table.TABLE else "#{table.TABLE} #{table.ALIAS}"

        return if table.IS_ROOT

        if table.ON?
            unless table.ON.match (/\=/)
                table.ON += "=#{table.ALIAS}.#{model.pk(table.TABLE)}"

        else
            switch table.ROLE
                when 'VOCABULARY'   then @adjust_join_for_vocabulary table, past_tables
                when 'CHILD'        then @adjust_join_for_child      table, past_tables
                else
                    @adjust_join_for_vocabulary table, past_tables
                    @adjust_join_for_child      table, past_tables

        unless table.ON?
            throw "Unjoined #{table.FROM}"

        table.FROM  = " #{table.JOIN ?= 'LEFT'} JOIN #{table.FROM} ON "
        table.FROM += "(" if table.FILTERS.length > 0
        table.FROM += table.ON
        for i in table.FILTERS
            table.FROM += " AND #{i.EXPRESSION}"
            @parameters.push j for j in i.VALUES
        table.FROM += ")" if table.FILTERS.length > 0

    parse_table: (table) ->

        m = table.TABLE.match(/^(\<[\-\=]|[\-\=]\>)\s*/)
        if m?
            table.TABLE = table.TABLE.replace m[0], ''
            table.JOIN = if m[1].match(/\-/) then 'LEFT' else 'INNER'
            table.ROLE = if m[1].match(/\>/) then 'VOCABULARY' else 'CHILD'

        m = table.TABLE.match(/\s*\:\s*(.*)$/)
        if m?
            table.TABLE = table.TABLE.replace m[0], ''
            last = ''
            table.COLUMNS = []
            depth = 0;
            for i in (m[1] + ',').split(/([\(\)\,])/)
                switch i
                    when "("
                        last += i
                        depth++
                    when ')'
                        last += i
                        depth--
                    when ','
                        if depth > 0
                            last += i
                        else
                            table.COLUMNS.push last
                            last = ''
                    else
                        last += i

        m = table.TABLE.match(/\s*ON\s*(.*)$/)
        if m?
            table.TABLE = table.TABLE.replace m[0], ''
            table.ON = m[1]

        m = table.TABLE.match(/\s*AS\s*(.*)$/)
        if m?
            table.TABLE = table.TABLE.replace m[0], ''
            table.ALIAS = m[1]

        table.ALIAS ?= table.TABLE

    adjust_columns: (table) ->
        @set_default_columns table
        table.COLUMN_ALIAS_PREFIX = if table.IS_ROOT then '' else table.TABLE + '.'
        table.COLUMNS = (@parse_column table, i for i in table.COLUMNS)
        delete table.COLUMN_ALIAS_PREFIX

    count_marx: (expression) -> expression.replace(/[^\?]/g, '').length

    adjust_null_filter_expression: (expression) ->
        return [expression, []] if expression.match(/\s+IS(\s+NOT)?\s+NULL\s*$/)
        clause = if expression.match(/(NOT|\<\>)/)? then ' IS NOT NULL' else ' IS NULL'
        return [expression.replace(/(\s+IS)?(\s+NOT)?(\s+NULL)?\s*$/, clause), []]

    adjust_scalar_filter_expression: (expression, value) ->
        return @adjust_null_filter_expression expression if !value?
        expression += '=' unless expression.match(/[\<\=\>]/)?
        expression += '?'
        return [expression, [value]]

    adjust_vector_filter_expression: (expression, value) ->
        value = [value] unless is_array value
        value = [-1] if value.length is 0
        expression += ' IN' unless expression.match(/\s+IN\s*$/)?
        expression += '(?'
        expression += ',?' for i in [0..value.length - 1]
        expression += ')'
        return [expression, value]

    adjust_filter_expression: (expression, value) ->
        if (is_array value) or (expression.match(/\s+IN\s*$/)?) then @adjust_vector_filter_expression expression, value else @adjust_scalar_filter_expression expression, value

    add_filter: (table, expression, value) ->
        marx = @count_marx expression
        if marx is 0
            [expression, value] = @adjust_filter_expression expression, value
            marx = @count_marx expression
        value = [value] unless is_array value
        throw "Paramaters skew: #{value.length} values given for #{marx} placeholders in #{expression}" if marx isnt value.length
        table.FILTERS.push {
            EXPRESSION: @globalize_expression(table, expression)
            VALUES: value
            IS_AGGR: @is_aggr expression
        }

    adjust_filters: (table) ->
        table.FILTERS = []
        for i of table
            continue if i.match (/^[A-Z][A-Z_]*$/)
            @add_filter table, i, table[i]

    get_select: () ->
        result = '';
        for c in @cols_by_aggr
            for i in c
                result += ',' if result
                result += i.SELECT
        return 'SELECT ' + result

    get_from: () ->
        result = ' FROM ';
        result += table.FROM for table in @tables
        result

    get_group_by: () ->
        return '' if @cols_by_aggr[0].length * @cols_by_aggr[1].length == 0
        result = '';
        for i in @cols_by_aggr[0]
            result += ',' if result
            result += i.EXPRESSION
        return ' GROUP BY ' + result

    get_where_or_having: (is_aggr, keyword) ->
        filters = @root.FILTERS
        result = '';
        for i in filters
            continue unless i.IS_AGGR == is_aggr
            result += ' AND ' if result.length = 0
            result += i.EXPRESSION
            @parameters.push j for j in i.VALUES
        return if result.length == 0 then '' else " #{keyword} #{result}"

    get_where:  () -> @get_where_or_having 0, 'WHERE'
    get_having: () -> @get_where_or_having 1, 'HAVING'

    get_order_by: () ->
        return ' ORDER BY ' + @globalize_expression @root, @root.ORDER if @root.ORDER?
        return '' if @cols_by_aggr[0].length == 0
        o = i.EXPRESSION for i in @cols_by_aggr[0] when i.ORDER < 1000000
        return ' ORDER BY ' + o if o?.length > 0
        return ''

    get_sql_select: () ->
        @get_select() + @get_from() + @get_where() + @get_group_by() + @get_having() + @get_order_by()

    get: () ->
        @root = @tables[0]
        @root.IS_ROOT = true
        past_tables = []
        @joined_tables = []
        for table in @tables
            @parse_table     table
            @adjust_columns  table
            @adjust_filters  table
            @adjust_join     table, past_tables
            past_tables.push table
            @joined_tables.push table unless table.IS_ROOT
        @cols_by_aggr[0].sort((a, b) -> a.ORDER - b.ORDER)
        [@get_sql_select(), @parameters]